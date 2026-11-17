import { NO_CATEGORY_PLACEHOLDER } from "@config/Header/image.config";
import { PRODUCT_PARAMETER_ENDPOINT, PRODUCT_USER_REVIEW_LIKES_ENDPOINT, REVIEW_ENDPOINT, REVIEW_LIKE_ENDPOINT, REVIEW_REPORT_ENDPOINT, STORE_PARAMETER_ENDPOINT, STORE_REVIEW_ENDPOINT, STORE_REVIEW_STORE_ENDPOINT, STORE_REVIEW_USER_ENDPOINT } from "@config/api.config";
import { getTenantConfig } from "@config/tenant.config";
import axiosClient from "./axios";
import { customerReviewsCache } from "../utils/cache";

// Store review response types
export interface ParameterRating {
    parameterName: string;
    avgRating: number;
}

export interface OverallRating {
    average: number;
    rating: number;
    totalReview: number;
    percentages: Record<string, number>;
    starDistribution: Record<string, number>;
    parameterRatings: ParameterRating[];
}

export interface Review {
    overall_rating: number;
    user_firstname: string;
    user_lastname: string;
    content: string;
    daysAgo: string;
    updated_at: string;
    created_at: string;
}

export interface StoreReviewData {
    overallrating: OverallRating;
    reviews: Review[];
    totalReviews?: number;
}

interface StoreReviewApiResponse {
    status: string;
    data: StoreReviewData;
}

// Map to store pending requests for deduplication
const pendingCustomerReviewsRequests = new Map<string, Promise<CustomerReviewsData | null>>();
const pendingReviewRequests = new Map<string, Promise<unknown>>();
const pendingStoreReviewUserRequests = new Map<string, Promise<unknown>>();

function dedupeRequest<T>(
    map: Map<string, Promise<T>>,
    key: string,
    factory: () => Promise<T>
): Promise<T> {
    const existing = map.get(key);
    if (existing) {
        return existing;
    }

    const promise = factory().finally(() => {
        map.delete(key);
    });
    map.set(key, promise);
    return promise;
}

// Customer reviews response type
export interface CustomerReview {
    id?: string;
    user_firstname?: string;
    user_lastname?: string;
    overall_rating?: number;
    content?: string;
    title?: string;
    user_profilepic?: string;
    order_id?: string;
    created_at?: string;
    status?: string;
}

export interface CustomerReviewsData {
    data: CustomerReview[];
}

// Product reviews

export const getProductParameter = async (store_id: string) => {
    try {
        const response = await axiosClient.get(`${PRODUCT_PARAMETER_ENDPOINT}`, {
            headers: {
                "Store-Id": store_id
            }
        });
        return response.data;
    } catch (error) {

        throw error;
    }
};

export type ReviewReactionType = 'like' | 'dislike';

export interface ReviewReactionMediaMetadata {
    width: number;
    height: number;
}

export interface ReviewReactionPayload {
    review_id: number;
    thumbnail_url: string;
    media_metadata: ReviewReactionMediaMetadata;
    display_order: string;
    status: string;
    reaction_type: ReviewReactionType;
}

export interface ReviewReportPayload {
    review_id: number;
    reason_code: string;
    reason_detail: string;
}

const DEFAULT_THUMBNAIL_URL =
    getTenantConfig().productPlaceholderImageUrl || NO_CATEGORY_PLACEHOLDER;

export const buildReviewReactionPayload = (
    reviewId: number | string,
    reactionType: ReviewReactionType,
    thumbnailUrl?: string
): ReviewReactionPayload => ({
    review_id: Number(reviewId),
    thumbnail_url: thumbnailUrl || DEFAULT_THUMBNAIL_URL,
    media_metadata: {
        width: 100,
        height: 100,
    },
    display_order: '1',
    status: 'active',
    reaction_type: reactionType,
});

export const postReviewReaction = async (payload: ReviewReactionPayload, store_id: string) => {
    try {
        const response = await axiosClient.post(`${REVIEW_LIKE_ENDPOINT}`, payload, {
            headers: {
                "Store-Id": store_id
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const postReviewReport = async (payload: ReviewReportPayload, store_id: string) => {
    try {
        const response = await axiosClient.post(`${REVIEW_REPORT_ENDPOINT}`, payload, {
            headers: {
                "Store-Id": store_id
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export interface ProductUserReviewLikeItem {
    like_id?: number;
    review_id?: number | string;
    reviewId?: number | string;
    reaction_type?: string;
    reactionType?: string;
    product_id?: string;
}

export type ProductUserReviewLikesResponse =
    | ProductUserReviewLikeItem[]
    | {
        status?: string;
        message?: string;
        data?: ProductUserReviewLikeItem[] | Record<string, ProductUserReviewLikeItem | string>;
    };

export const getProductUserReviewLikes = async (
    productId: string,
    store_id: string
): Promise<ProductUserReviewLikesResponse> => {
    try {
        const response = await axiosClient.get<ProductUserReviewLikesResponse>(
            PRODUCT_USER_REVIEW_LIKES_ENDPOINT,
            {
                params: {
                    productid: productId,
                },
                headers: {
                    "Store-Id": store_id,
                },
            }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const postReview = async (payload: unknown, store_id: string) => {
    try {
        const response = await axiosClient.post(`${REVIEW_ENDPOINT}`, payload, {
            headers: {
                "Store-Id": store_id
            }
        });
        return response.data;
    } catch (error) {

        throw error;
    }
}

export const getReview = async (order_id: string) => {
    return dedupeRequest(pendingReviewRequests, order_id, async () => {
        try {
            const response = await axiosClient.get(`${REVIEW_ENDPOINT}`, {
                params: {
                    page: 1,
                    limit: 10,
                    status: 'active',
                    language: 'en',
                    is_product_review: 1,
                    order_id: order_id
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    });
}

// Store reviews

export const getStoreParameter = async () => {
    try {
        const response = await axiosClient.get(`${STORE_PARAMETER_ENDPOINT}`);
        return response.data;
    } catch (error) {

        throw error;
    }
}

export const postStoreReview = async (payload: unknown, store_id: string) => {
    try {
        const response = await axiosClient.post(`${STORE_REVIEW_ENDPOINT}`, payload, {
            headers: {
                "Store-Id": store_id
            }
        });
        return response.data;
    } catch (error) {

        throw error;
    }
}

export const getStoreReviewUser = async (order_id: string) => {
    return dedupeRequest(pendingStoreReviewUserRequests, order_id, async () => {
        try {
            const response = await axiosClient.get(`${STORE_REVIEW_USER_ENDPOINT}?order_id=${order_id}&skip=0&limit=10`);
            return response.data;
        } catch (error) {
            throw error;
        }
    });
}

/**
 * Fetches store reviews for the homepage (client-side only).
 * No caching - always fetches fresh data for up-to-date reviews.
 * 
 * @param {string} store_id - The store ID.
 * @param {number | undefined} limit - The limit of reviews to fetch.
 * @param {number | undefined} skip - The number of reviews to skip.
 * @returns {Promise<StoreReviewData | null>} The store review data or null if not successful.
 * @throws Will throw an error if the request fails.
 */
export const getHomePageStoreReview = async (store_id: string, limit?: number, skip?: number): Promise<StoreReviewData | null> => {
    try {
        const queryParams = new URLSearchParams();

        if (limit !== undefined) queryParams.append('limit', limit.toString());
        if (skip !== undefined) queryParams.append('skip', skip.toString());

        const url = `${process.env.NEXT_PUBLIC_API_URL}${STORE_REVIEW_STORE_ENDPOINT}?${queryParams.toString()}`;

        const response = await axiosClient.get<StoreReviewApiResponse>(url, {
            headers: {
                "Store-Id": store_id,
            }
        });

        // Check HTTP status code and return data directly
        if (response.status === 200 && response.data?.data) {
            return response.data.data;
        }

        return null;
    } catch (error) {
        throw error;
    }
}

/**
 * Fetches customer reviews (testimonials) with request deduplication and caching.
 * Prevents multiple concurrent API calls with the same parameters.
 * Uses LRU cache with 5-minute TTL to improve performance.
 * 
 * @param {string | undefined} token - Optional authorization token.
 * @param {string | undefined} storeId - Optional store ID for store-specific reviews.
 * @returns {Promise<CustomerReviewsData | null>} The customer reviews data or null if not successful.
 * @throws Will throw an error if the request fails.
 */
export const getCustomerReviews = async (token?: string, storeId?: string): Promise<CustomerReviewsData | null> => {
    // Include storeId in cache key for store-specific caching
    const cacheKey = storeId ? `customerReviews_${storeId}` : 'customerReviews';

    try {
        // Check cache first
        const cachedData = customerReviewsCache.get(cacheKey);
        if (cachedData) {
            return cachedData as unknown as CustomerReviewsData;
        }

        // Check for pending request (deduplication)
        const existingRequest = pendingCustomerReviewsRequests.get(cacheKey);
        if (existingRequest) {
            return await existingRequest;
        }

        // Create new request promise
        const requestPromise = (async (): Promise<CustomerReviewsData | null> => {
            try {
                const response = await axiosClient.get(`${STORE_REVIEW_ENDPOINT}`, {
                    headers: {
                        ...(token && { Authorization: token }),
                        ...(storeId && { "Store-Id": storeId }),
                    }
                });

                if (response.status === 200 && response.data) {
                    customerReviewsCache.set(cacheKey, response.data as unknown as Record<string, unknown>);
                    return response.data;
                }

                return null;
            } finally {
                pendingCustomerReviewsRequests.delete(cacheKey);
            }
        })();

        pendingCustomerReviewsRequests.set(cacheKey, requestPromise);
        return await requestPromise;
    } catch (error) {
        pendingCustomerReviewsRequests.delete(cacheKey);
        throw error;
    }
}

