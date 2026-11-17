import axiosClient from "./axios";
import { POPULAR_PRODUCTS_ENDPOINT } from "@config/api.config";
import { multiSearchProducts } from "@services/typesense/productService";
import type { TypesenseProduct } from "@services/typesense/types";
import {
  mapRetailCatalogProduct,
  shouldUseRetailCatalogSearch,
} from "../utils/typesenseRetailCatalog";
import { shouldUseRetailProductPricing } from "../utils/retailStorefrontPricing";

/** API response when popular-products-storewise returns only product IDs */
export interface PopularProductIdsResponse {
  status: string;
  data: string[];
  count?: number;
  metadata?: Record<string, unknown>;
}

export interface PopularProductResponse {
  status: string;
  message: string;
  data: PopularProduct[];
  totalCount: number;
}

export interface PopularProduct {
  productId: string;
  storefrontId: string;
  name: {
    en: string;
    [key: string]: string;
  };
  description?: {
    en?: string;
    [key: string]: string | undefined;
  };
  type: {
    hasVariants: boolean;
    category: string;
    isModifier: boolean;
    hasModifiers: boolean;
    canBeSoldIndependently: boolean;
    allowHalfHalf: boolean;
    isAlsoAProduct: boolean;
    enableSizeChart: boolean;
  };
  media?: Array<{
    _id: string;
    type: string;
    url: string;
    metadata?: {
      thumbnail?: string;
      isPrimary?: boolean;
      displayOrder?: number;
      alt?: string;
      title?: string;
    };
    isHide?: boolean;
    applyToAllVariants?: boolean;
  }>;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[] | null;
    urlManagement?: {
      urlPattern?: string;
      currentUrl?: string;
      customSlug?: string;
      canonicalUrl?: string;
    };
    socialMediaImages?: Array<{
      type: string;
      url: string;
    }>;
  };
  brandName?: string;
  brandSlug?: string;
  variantAttributes?: Array<{
    name: string;
    options: string[];
  }> | null;
  overallRatings?: {
    average: number;
    totalReview: number;
    starDistribution?: {
      [key: string]: number;
    } | null;
    percentages?: {
      [key: string]: number;
    } | null;
    verifiedStatus?: {
      verified: number;
      average: number;
    };
  };
  storefrontPrices?: {
    allVariantsSamePrice: boolean;
    costOfGoods: number;
    tieredPricing: boolean;
    unitPrice: number;
    storefrontId: string;
  };
  basePrice?: number;
  discountedPrice?: number;
  productCategoryId: string;
  productCategoryName: {
    en: string;
    [key: string]: string;
  };
  productCategorySlug: string;
  variants?: Array<{
    variantId: string;
    variantSku: string;
    attributes: Array<{
      name: string;
      value: string;
    }>;
    basePrice?: number;
    discountedPrice?: number;
    storefrontPrices?: {
      allVariantsSamePrice: boolean;
      costOfGoods: number;
      tieredPricing: boolean;
      unitPrice: number;
      storefrontId: string;
    };
  }> | null;
}

/**
 * Fetches popular product IDs only from popular-products-storewise API.
 * @param storeId - Store id (tenant_id) from the store API
 * @param options - Optional query params (days, skip, limit)
 * @returns Promise<string[]> Product IDs in order returned by API
 */
export const getPopularProductIds = async (
  storeId: string,
  options?: { days?: number; skip?: number; limit?: number }
): Promise<string[]> => {
  try {
    const response = await axiosClient.get<PopularProductIdsResponse>(POPULAR_PRODUCTS_ENDPOINT, {
      params: {
        days: options?.days ?? 30,
        skip: options?.skip ?? 0,
        limit: options?.limit ?? 10,
        tenant_id: storeId,
      },
    });
    const data = response.data?.data;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw error;
  }
};

/**
 * Fetches popular products via: popular-products-storewise (IDs) → Typesense multi_search (full data).
 * Uses filter_by productId:=[id1,id2,...] && status:=ACTIVE. Preserves API order.
 * Retail/Grocery: applies storefront unitPrice/salesPrice mapping only.
 * Restaurant/Laundry: unchanged pass-through pricing.
 * @param storeId - Store id (tenant_id)
 * @param options - days, skip, limit for the popular IDs API; optional accountType
 * @returns Promise<TypesenseProduct[]>
 */
export const getPopularProductsFromTypesense = async (
  storeId: string,
  options?: {
    days?: number;
    skip?: number;
    limit?: number;
    accountType?: string | null;
  }
): Promise<TypesenseProduct[]> => {
  try {
    const ids = await getPopularProductIds(storeId, options);
    if (!ids.length) return [];

    const isRetailCatalog = shouldUseRetailCatalogSearch(options?.accountType);
    const filterBy = `productId:=[${ids.join(",")}] && status:=ACTIVE`;
    const results = await multiSearchProducts(
      [
        {
          q: "*",
          query_by: "name",
          filter_by: filterBy,
          per_page: 50,
          exclude_fields: "embedding",
          ...(isRetailCatalog ? { __retailCatalog: true } : {}),
        },
      ],
      storeId
    );
    let products: TypesenseProduct[] = results[0]?.products ?? [];

    // If accountType unknown, still remap docs that are explicitly RETAIL/GROCERY
    if (!isRetailCatalog) {
      products = products.map((product) => {
        const productKind = (product as TypesenseProduct & { productKind?: string })
          .productKind;
        if (shouldUseRetailProductPricing(productKind)) {
          return mapRetailCatalogProduct(product);
        }
        return product;
      });
    }

    const idToIndex = Object.fromEntries(ids.map((id, i) => [id, i]));
    products.sort((a, b) => {
      const ai = idToIndex[a.productId] ?? 999;
      const bi = idToIndex[b.productId] ?? 999;
      return ai - bi;
    });
    return products;
  } catch (error) {
    throw error;
  }
};

