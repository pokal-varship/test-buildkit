import type { SessionTicketItem } from "@services/sessionService";
import type { CartItem } from "@services/storePage";

/** Minimal product shape needed to map session item to cart item */
export type ProductForCartItem = {
  id?: string;
  name?: Record<string, string> | { en?: string } | string;
  slug?: string;
};

type ProductItemsAndLineCountInput = {
  isQrFlow: boolean;
  allSessionProductItemsAsCart: CartItem[];
  cartItems: CartItem[] | null | undefined;
  productId: string | null | undefined;
  getDistinctSessionLineCount: number;
  getDistinctProductLineCount: number;
};

type ProductItemsAndLineCountResult = {
  allProductItems: CartItem[];
  lineCount: number;
};

/** Normalizes numeric-like values (including strings) into safe numbers. */
export function normalizePrice(value: unknown): number {
  const num = Number(value);
  return Number.isNaN(num) ? 0 : num;
}

/**
 * Shared resolver for PDP customization decisions in both QR/session flow and cart flow.
 * Keeps `allProductItems` and `lineCount` selection in one place.
 */
export function getProductItemsAndLineCount({
  isQrFlow,
  allSessionProductItemsAsCart,
  cartItems,
  productId,
  getDistinctSessionLineCount,
  getDistinctProductLineCount,
}: ProductItemsAndLineCountInput): ProductItemsAndLineCountResult {
  const lineCount = isQrFlow
    ? getDistinctSessionLineCount
    : getDistinctProductLineCount;

  const allProductItems = isQrFlow
    ? allSessionProductItemsAsCart
    : (cartItems?.filter((item) => item.productId === productId) ?? []);

  return { allProductItems, lineCount };
}

/**
 * Maps a session ticket item to CartItem shape.
 * Used by MainProduct (QR edit flow) and ProductOptions (synthetic cart item, multiple customizations).
 */
function ticketItemComboGroups(
  t: SessionTicketItem
): unknown[] | undefined {
  const raw = (t as { comboGroups?: unknown }).comboGroups;
  return Array.isArray(raw) ? raw : undefined;
}

/**
 * Session ticket lines mirror cart lines for dine-in; combo rows include `comboGroups` and often `productType: "COMBO"`.
 * Must match OrderItemList `ticketItemToDisplayItem` so PDP / ComboFlow edit sees full combo state.
 */
export function sessionTicketItemToCartItem(
  t: SessionTicketItem,
  product: ProductForCartItem,
  options?: { quantity?: number; variantIdOverride?: string }
): CartItem {
  const qty = options?.quantity ?? t.quantity ?? 1;
  // Some APIs can return numeric fields as strings; normalize defensively.
  const unitPrice = normalizePrice(t.unitBasePrice ?? t.unitPrice ?? 0);
  const totalPrice = normalizePrice(t.totalBasePrice ?? t.totalPrice ?? unitPrice);
  const baseDiscountAmount = normalizePrice(t.baseDiscountAmount ?? 0);
  const totalBasePriceAfterBaseDiscount = normalizePrice(t.totalBasePriceAfterBaseDiscount ?? (totalPrice - baseDiscountAmount));
  const nameFromProduct = product?.name;
  const productName =
    (t.productName as Record<string, string>) ??
    (typeof nameFromProduct === "object" && nameFromProduct !== null
      ? (nameFromProduct as Record<string, string>)
      : typeof nameFromProduct === "string"
        ? { en: nameFromProduct }
        : {});
  const productCategory = (t.productCategory as Record<string, string>) ?? {};
  const comboGroups = ticketItemComboGroups(t);
  const tExt = t as unknown as { productType?: string };
  const declaredType =
    typeof tExt.productType === "string" ? tExt.productType : undefined;
  const productType =
    declaredType ??
    (comboGroups && comboGroups.length > 0 ? "COMBO" : "REGULAR");
  const variantAttrs =
    (t as { variantAttributes?: Record<string, string> }).variantAttributes ?? {};
  return {
    id: t.id,
    productId: t.itemId,
    productSku: t.productSku ?? t.itemId,
    productName: productName as { en: string },
    productSlug: (t.productSlug as string) || product?.slug || "",
    productCategorySlug: (t.productCategorySlug as string) ?? "",
    productCategory: productCategory as { en: string },
    productCategoryId: (t.itemCategoryId as string) ?? "",
    quantity: qty,
    unitBasePrice: unitPrice,
    totalBasePrice: totalPrice,
    totalBaseDiscountAmount: baseDiscountAmount,
    totalBasePriceAfterBaseDiscount: totalBasePriceAfterBaseDiscount,
    totalOfferDiscountAmount: 0,
    subTotalAfterDiscount: totalPrice,
    subTotalBeforeDiscountAndTaxes: totalPrice,
    modifierGroup: Array.isArray(t.modifierGroup) ? (t.modifierGroup as CartItem["modifierGroup"]) : [],
    specialInstructions: t.specialInstructions ?? "",
    productType,
    ...(comboGroups?.length ? { comboGroups } : {}),
    cartId: "",
    storefrontId: "",
    menuSlug: "",
    variantAttributes: variantAttrs,
    variantId: options?.variantIdOverride ?? t.variantId ?? "",
    metaData: (t.metaData as Record<string, unknown>) ?? {},
    ...(typeof t.estimatedLoyaltyPoints === "number"
      ? { estimatedLoyaltyPoints: t.estimatedLoyaltyPoints }
      : {}),
  } as unknown as CartItem;
}
