/**
 * Retail / Grocery catalog Typesense helpers for PLP.
 * Restaurant and Laundry keep the existing menu-based flow and default product mapping.
 */

import { getProductCollectionName } from "@services/typesense/config";
import type {
  TypesenseProduct,
  TypesenseSearchParams,
} from "@services/typesense/types";
import { resolveStorefrontDisplayPrices } from "./retailStorefrontPricing";

export type CatalogAccountType =
  | "Retail"
  | "Restaurant"
  | "Laundry"
  | "Grocery"
  | string;

/**
 * Use retail catalog search when accountType is Retail or Grocery.
 * Restaurant / Laundry → false (existing menu Typesense flow).
 */
export const shouldUseRetailCatalogSearch = (
  accountType?: string | null,
): boolean => {
  const normalized = (accountType || "").trim().toLowerCase();
  return normalized === "retail" || normalized === "grocery";
};

/** Maps store accountType to Typesense productKind filter value */
export const getProductKindForAccountType = (
  accountType?: string | null,
): string => {
  const normalized = (accountType || "").trim().toUpperCase();
  if (normalized === "GROCERY") return "GROCERY";
  return "RETAIL";
};

/**
 * Retail/Grocery product mapping only:
 * - basePrice  ← storefrontPrices.unitPrice
 * - discounted ← storefrontPrices.salesPrice (when present and lower than unitPrice)
 * - if no salesPrice → show unitPrice only
 * - normalize productCategorySlug from categorySlugs for full-menu grouping
 */
export const mapRetailCatalogProduct = (
  typesenseProduct: TypesenseProduct,
): TypesenseProduct => {
  if (!typesenseProduct) {
    return typesenseProduct;
  }

  const categorySlugs = Array.isArray(typesenseProduct.categorySlugs)
    ? typesenseProduct.categorySlugs.filter(Boolean)
    : [];
  const resolvedCategorySlug =
    typesenseProduct.productCategorySlug || categorySlugs[0] || "";

  const unitPrice = typesenseProduct.storefrontPrices?.unitPrice;
  const hasUnitPrice =
    typeof unitPrice === "number" && Number.isFinite(unitPrice);

  if (!hasUnitPrice) {
    return {
      ...typesenseProduct,
      productCategorySlug: resolvedCategorySlug,
      ...(categorySlugs.length > 0 ? { categorySlugs } : {}),
    };
  }

  const resolvedPrices = resolveStorefrontDisplayPrices(
    typesenseProduct.storefrontPrices,
  );
  const discountedPrice = resolvedPrices?.discountedPrice ?? 0;

  const primaryVariant = typesenseProduct.primaryVariant
    ? {
        ...typesenseProduct.primaryVariant,
        basePrice: unitPrice,
        discountedPrice,
      }
    : typesenseProduct.primaryVariant;

  return {
    ...typesenseProduct,
    productCategorySlug: resolvedCategorySlug,
    ...(categorySlugs.length > 0 ? { categorySlugs } : {}),
    basePrice: unitPrice,
    discountedPrice,
    primaryVariant,
  };
};

export interface RetailCatalogSearchOptions {
  storeId: string;
  categorySlug?: string;
  accountType?: string | null;
  page?: number;
  isFullMenuPage?: boolean;
}

/**
 * Builds the retail/grocery PLP multi_search payload.
 * Sets __retailCatalog so productService applies retail-only response handling.
 * Collection: ecom-products-{storeId}
 */
export const buildRetailCatalogSearchRequests = (
  options: RetailCatalogSearchOptions,
): TypesenseSearchParams[] => {
  const {
    storeId,
    categorySlug,
    accountType,
    page = 1,
    isFullMenuPage = false,
  } = options;

  const productKind = getProductKindForAccountType(accountType);
  const collection = getProductCollectionName(storeId);

  const filterParts = [`productKind:=${productKind}`, "status:=ACTIVE"];

  if (!isFullMenuPage && categorySlug && categorySlug !== "full-menu") {
    filterParts.push(`categorySlugs:=${categorySlug}`);
  }

  const filter_by = filterParts.join(" && ");

  const sharedParams: TypesenseSearchParams = {
    collection,
    exclude_fields: "embedding",
    q: "*",
    query_by: "name.en,productCategoryName.en,categoryHierarchy,brandName",
    filter_by,
    prioritize_exact_match: true,
    text_match_type: "max_score",
    num_typos: "1,1,1,0",
    drop_tokens_threshold: 0,
    prefix: "true,true,true,false",
    sort_by: "_text_match:desc",
    page,
    query_by_weights: "100,55,45,15",
    group_by: "name",
    group_limit: 1,
    __retailCatalog: true,
  };

  const productSearch: TypesenseSearchParams = {
    ...sharedParams,
    facet_by: "categoryHierarchy,brandName,attributesOptions.facetAttributes",
    per_page: 20,
    max_facet_values: 100,
  };

  if (isFullMenuPage) {
    return [
      {
        ...productSearch,
        // Full menu needs a wider page size than category PLP (default 20)
        per_page: 100,
      },
    ];
  }

  const priceFacetSearch: TypesenseSearchParams = {
    ...sharedParams,
    facet_by: "storefrontPrices.minPrice",
    per_page: 0,
    max_facet_values: 20,
  };

  return [productSearch, priceFacetSearch];
};

export interface HeaderProductSearchOptions {
  q: string;
  menuId?: string;
  accountType?: string | null;
  page?: number;
  per_page?: number;
}

/**
 * Header / mobile search Typesense params.
 * Retail/Grocery → __retailCatalog (storefront price mapping) + productKind filter.
 * Restaurant/Laundry → existing name/description + linkedMenuIds search.
 */
export const buildHeaderProductSearchRequest = (
  options: HeaderProductSearchOptions,
): TypesenseSearchParams => {
  const {
    q,
    menuId = "",
    accountType,
    page = 1,
    per_page = 100,
  } = options;

  const isRetailCatalog = shouldUseRetailCatalogSearch(accountType);
  const filterParts = ["status:=ACTIVE"];

  if (isRetailCatalog) {
    filterParts.push(
      `productKind:=${getProductKindForAccountType(accountType)}`,
    );
  } else if (menuId) {
    filterParts.push(`linkedMenuIds:=[${menuId}]`);
  }

  if (isRetailCatalog) {
    return {
      q: q || "*",
      query_by: "name.en,productCategoryName.en,categoryHierarchy,brandName",
      query_by_weights: "100,55,45,15",
      page,
      per_page,
      filter_by: filterParts.join(" && "),
      group_by: "name",
      group_limit: 1,
      exclude_fields: "embedding",
      __retailCatalog: true,
    };
  }

  return {
    q,
    query_by: "name, description, productCategoryName.en",
    page,
    per_page,
    filter_by: filterParts.join(" && "),
  };
};

