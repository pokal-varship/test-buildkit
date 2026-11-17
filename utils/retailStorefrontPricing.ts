/**
 * Shared Retail/Grocery storefront price helpers (PLP + PDP).
 * Restaurant / Laundry must not use these remaps.
 */

import type {
  ProductData,
  ProductResponse,
  Variant,
} from "@components/type/pdp.type";

export type StorefrontPricesLike = {
  unitPrice?: number;
  salesPrice?: number;
  isSalesPriceSet?: boolean;
  minPrice?: number;
  maxPrice?: number;
  allVariantsSamePrice?: boolean;
  storefrontId?: string;
};

/**
 * True when product API productKind is Retail or Grocery.
 * Prefer this on PDP (comes on the product payload).
 */
export const shouldUseRetailProductPricing = (
  productKind?: string | null,
): boolean => {
  const normalized = (productKind || "").trim().toUpperCase();
  return normalized === "RETAIL" || normalized === "GROCERY";
};

/**
 * Resolve display prices from storefrontPrices.
 * - basePrice  ← unitPrice
 * - discounted ← salesPrice when set and lower than unitPrice
 * - otherwise discounted = 0 (show unitPrice only)
 */
export const resolveStorefrontDisplayPrices = (
  storefrontPrices?: StorefrontPricesLike | null,
): { basePrice: number; discountedPrice: number } | null => {
  const unitPrice = storefrontPrices?.unitPrice;
  if (typeof unitPrice !== "number" || !Number.isFinite(unitPrice)) {
    return null;
  }

  const salesPrice = storefrontPrices?.salesPrice;
  const salesPriceExplicitlyOff = storefrontPrices?.isSalesPriceSet === false;
  const hasSalesPrice =
    !salesPriceExplicitlyOff &&
    typeof salesPrice === "number" &&
    Number.isFinite(salesPrice) &&
    salesPrice > 0 &&
    salesPrice < unitPrice;

  return {
    basePrice: unitPrice,
    discountedPrice: hasSalesPrice ? salesPrice : 0,
  };
};

const mapVariantRetailPrices = (
  variant: Variant,
  fallbackStorefrontPrices?: StorefrontPricesLike | null,
): Variant => {
  const resolved = resolveStorefrontDisplayPrices(
    variant.storefrontPrices ?? fallbackStorefrontPrices,
  );
  if (!resolved) return variant;
  return {
    ...variant,
    basePrice: resolved.basePrice,
    discountedPrice: resolved.discountedPrice,
  };
};

/**
 * PDP only: remap ProductResponse prices for Retail/Grocery.
 * Restaurant / Laundry / unknown productKind → identity (unchanged).
 */
export const applyRetailStorefrontPricesToProductResponse = (
  response: ProductResponse | null | undefined,
): ProductResponse | null | undefined => {
  if (!response?.data) return response;

  const { data } = response;
  if (!shouldUseRetailProductPricing(data.productKind)) {
    return response;
  }

  const productPrices = resolveStorefrontDisplayPrices(data.storefrontPrices);
  const variants = Array.isArray(data.variants)
    ? data.variants.map((variant) =>
        mapVariantRetailPrices(variant, data.storefrontPrices),
      )
    : data.variants;

  const nextData: ProductData = {
    ...data,
    ...(productPrices
      ? {
          basePrice: productPrices.basePrice,
          discountedPrice: productPrices.discountedPrice,
        }
      : {}),
    variants,
  };

  return {
    ...response,
    data: nextData,
  };
};
