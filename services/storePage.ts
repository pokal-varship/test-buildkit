import {  PAGE_CONFIG_ENDPOINT, STORES_CATEGORIES_ENDPOINT } from '@config/api.config';
import axiosClient from './axios';
import { Category } from '@components/type/store.types';
import { SEO } from 'types/metadata.type';
import { pageConfigCache } from '../utils/cache';

// Map to store pending requests for deduplication
const pendingStorePageRequests = new Map<string, Promise<StoreData>>();

/**
 * Creates a dynamic cache key for store page requests based on defined parameters.
 * Only includes parameters that have values to ensure efficient caching.
 * 
 * @param {string} pageType - The type of the page for which to fetch the configuration.
 * @param {string} storeSlug - The store slug.
 * @param {string} category - The category slug (optional).
 * @param {string} productId - The product ID (optional).
 * @param {string} productSlug - The product slug (optional).
 * @param {string} storeId - The store ID (optional).
 * @param {string} categoryId - The category ID (optional).
 * @param {string} token - The authorization token (optional).
 * @returns {string} The cache key.
 */
const createStorePageCacheKey = (
    pageType: string,
    storeSlug: string,
    category?: string,
    productId?: string,
    productSlug?: string,
    storeId?: string,
    categoryId?: string,
    token?: string
): string => {
    const keyParts = [`pageType:${pageType}`, `storeSlug:${storeSlug}`];
    
    if (category) keyParts.push(`category:${category}`);
    if (productId) keyParts.push(`productId:${productId}`);
    if (productSlug) keyParts.push(`productSlug:${productSlug}`);
    if (storeId) keyParts.push(`storeId:${storeId}`);
    if (categoryId) keyParts.push(`categoryId:${categoryId}`);
    if (token) keyParts.push(`token:${token.substring(0, 10)}...`); // Only use first 10 chars for security
    
    return keyParts.join('_');
};

// Define proper types for our data
export interface Store {
    id: string;
    name: string;
    slug: string;
    address?: string;
    image?: string;
    // Add other properties as needed
}

type PageConfig = {
    title: string;
    slug: string;
    subheader: string;
    images: {
        id: number;
        url: string;
    }[];
};

// Define the StoreData type that includes SEO and PageConfig
export interface CartItemModifier {
    id: string;
    storefrontId: string;
    modifierGroupDetailId: string;
    modifierId: string;
    modifierName: { en: string };
    modifierSku: string;
    modifierStatus: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    createdAt: number;
    updatedAt: number;
}

export interface CartItemModifierGroup {
    id: string;
    storefrontId: string;
    modifierGroupId: string;
    modifierGroupName: { en: string };
    modifierGroupStatus: string;
    modifiersPrice: number;
    modifiers: CartItemModifier[];
}

export interface CartItem {
    id: string;
    storefrontId: string;
    cartId: string;
    productId: string;
    productName: { en: string };
    productCategoryId: string;
    productCategory: { en: string };
    productCategorySlug: string;
    productSlug: string;
    productType: string;
    productSku: string;
    productStatus: string;
    variantId: string;
    variantSku: string;
    variantStatus: string;
    variantAttributes: Record<string, string>;
    modifierGroup: CartItemModifierGroup[];
    quantity: number;
    unitBasePrice: number;
    totalBasePrice: number;
    baseModifiersPrice: number;
    finalModifiersPrice: number;
    subTotalBeforeDiscountAndTaxes: number;
    hasProductOffer: boolean;
    productOfferType: string;
    productOfferValue: number;
    productOfferDescription: string;
    isPromoCodeApplied: boolean;
    bogoQuantity: number;
    bundleDiscountThreshold: number;
    baseDiscountAmount: number;
    offerDiscountAmount: number;
    promoDiscountAmount: number;
    totalBaseDiscountAmount: number;
    totalOfferDiscountAmount: number;
    totalPromoDiscountAmount: number;
    totalDiscountAmount: number;
    totalBasePriceAfterBaseDiscount?: number;
    subTotalAfterDiscount: number;
    taxRate: number;
    taxAmount: number;
    finalPrice: number;
    specialInstructions: string;
    metaData: Record<string, unknown>;
    createdAt: number;
    updatedAt: number;
    appliedPromoCode?: {
        id: string;
        promoCode: string;
        promoCodeDiscountAmount: number;
    };
    menuSlug: string;
    /** Product image from cart API (`data.items[].mediaURL`) */
    mediaURL?: string;
    /** Loyalty points estimated for this cart line */
    estimatedLoyaltyPoints?: number;
}

export type StoreData = {
    message?: string;
    data: {
        seo: SEO;
        pageConfig: PageConfig;
        tenantId: string;
        total: {
            finalAmount: number;
        };
        id: string;
        items: CartItem[];
    }
};

export type StoreCartData = {
    data: {
        seo: SEO;
        pageConfig: PageConfig;
        tenantId: string;
        total: {
            finalAmount: number;
            itemSubTotal: number;
            estimatedLoyaltyPoints?: number;
            maximumLoyaltyPointsUsable?: number;
            maxCashbackUsable?: number;
            maximumCashbackPerOrder?: number;
        };
        id: string;
        items: CartItem[];
        orderType?: string;
        appliedPromoCode?: {
            id: string;
            promoCode: string;
            promoCodeDiscountAmount: number;
        };
        appliedOffers?: Array<{
            id: string;
            cartId: string;
            cartItemId: string;
            offerId: string;
            offerName: {
                [key: string]: string;
            };
            offerDescription: {
                [key: string]: string;
            };
            offerStatus: number;
            applicationLevel: string;
            offerType: string;
            discountType: string;
            minimumSpendValue: number;
            discountValue: number;
            discountAmount: number;
            originalPrice: number;
            priority: number;
            appliedAt: number;
            freeQuantity?: number;
        }>;
    }
};

/**
 * Fetches the tenant configuration for a given page type with request deduplication and caching.
 * Prevents multiple concurrent API calls with the same parameters.
 * Uses LRU cache with 15-minute TTL to improve performance.
 * 
 * @param {string} pageType - The type of the page for which to fetch the configuration.
 * @param {string} storeSlug - The store slug.
 * @param {string} category - The category slug (optional).
 * @param {string} productId - The product ID (optional).
 * @param {string} productSlug - The product slug (optional).
 * @param {string} storeId - The store ID (optional).
 * @param {string} categoryId - The category ID (optional).
 * @param {string} token - The authorization token (optional).
 * @returns {Promise<StoreData>} The tenant configuration data.
 * @throws Will throw an error if the request fails.
 */
export const getStorePageData = async (
    pageType: string,
    storeSlug: string,
    category?: string,
    productId?: string,
    productSlug?: string,
    storeId?: string,
    categoryId?: string,
    token?: string
): Promise<StoreData> => {
    // Create cache key based on defined parameters
    const cacheKey = createStorePageCacheKey(
        pageType,
        storeSlug,
        category,
        productId,
        productSlug,
        storeId,
        categoryId,
        token
    );
    
    try {
        // Check if data exists in cache first
        const cachedData = pageConfigCache.get(cacheKey);
        if (cachedData) {
            return cachedData as StoreData;
        }

        // Check if there's already a pending request for the same parameters
        const existingRequest = pendingStorePageRequests.get(cacheKey);
        if (existingRequest) {
            // Wait for the existing request to complete and return its result
            return await existingRequest;
        }

        // Create new request promise
        const requestPromise = (async (): Promise<StoreData> => {
            try {
                const response = await axiosClient.get(PAGE_CONFIG_ENDPOINT, {
                    params: {
                        pageType,
                        storeSlug: storeSlug,
                        categorySlug: category,
                        productId: productId,
                        productSlug: productSlug,
                        storeId: storeId,
                        categoryId: categoryId
                    },
                    headers: {
                        'Cache-Control': 'public, max-age=900',
                        'Authorization': token || undefined
                    }
                });

                // Cache the successful response
                pageConfigCache.set(cacheKey, response.data);
                return response.data;
            } finally {
                // Always remove the pending request when done (success or failure)
                pendingStorePageRequests.delete(cacheKey);
            }
        })();

        // Store the pending request
        pendingStorePageRequests.set(cacheKey, requestPromise);

        // Return the promise result
        return await requestPromise;
    } catch (error) {
        // Ensure pending request is cleaned up on error
        pendingStorePageRequests.delete(cacheKey);
        throw error;
    }
};

const categoryRequestCache = new Map<string, Promise<{ data: Category[] }>>();

export const getStoreCategories = async (menuId: string, storeId: string): Promise<{data: Category[]}> => {
    try {
        const params: { id?: string; storeSlug?: string; menuSlug?: string } = {};
        if (menuId) {
            params.menuSlug = menuId;
        }
        if (storeId) {
            params.storeSlug = storeId; 
        }

        const cacheKey = `${storeId || 'unknown'}::${menuId || 'all'}`;
        if (categoryRequestCache.has(cacheKey)) {
            return categoryRequestCache.get(cacheKey)!;
        }

        const request = axiosClient.get(STORES_CATEGORIES_ENDPOINT, {
            params,
            headers: {
                // "Store-Id": storeId
            }
        }).then((response) => {
            categoryRequestCache.delete(cacheKey);
            return response.data;
        }).catch((error) => {
            categoryRequestCache.delete(cacheKey);
            throw error;
        });

        categoryRequestCache.set(cacheKey, request);
        return request;
    } catch (error) {

        throw error;
    }
};

interface Product {
    basePrice: number;
    categoryId: string;
    description: string;
    discountedPrice: number;
    id: string;
    mediaUrl: string;
    name: string;
    promotion: string;
    nutritionalInfo :{
        values: {
        calories?: number;
        };
    }
}

/**
 * Fetches products for a specific menu and category from the API.
 * 
 * @param {string} menuId - The ID of the menu to fetch products for.
 * @param {string} categoryId - The ID of the category to fetch products for.
 * @returns {Promise<Product[]>} The products data.
 * @throws Will throw an error if the request fails.
 */
export const getStoreProducts = async (menuId: string, categoryId: string): Promise<Product[]> => {
    try {
        const response = await axiosClient.get('/e-commerce/v1/tenant/products', {
            params: {
                menuId,
                categoryId
            }
        });
        return response.data.data;
    } catch (error) {

        throw error;
    }
};
  
