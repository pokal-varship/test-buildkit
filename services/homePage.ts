import axiosClient from './axios';
import { PAGE_CONFIG_ENDPOINT, STORES_ENDPOINT } from '@config/api.config';
import { pageConfigCache, storeCache } from '../utils/cache';
import axios from 'axios';

// Maps to store pending requests for deduplication
const pendingPageConfigRequests = new Map<string, Promise<object>>();
const pendingStoreRequests = new Map<string, Promise<object>>();

/**
 * Creates a cache key for page config requests.
 * 
 * @param {string} pageType - The type of the page for which to fetch the configuration.
 * @param {string} token - The authorization token.
 * @returns {string} The cache key.
 */
const createPageConfigRequestKey = (pageType: string, token?: string): string => {
    return token ? `${pageType}_${token}` : pageType;
};

/**
 * Creates a cache key based on the request parameters.
 * 
 * @param {number} latitude - The latitude of the user's location.
 * @param {number} longitude - The longitude of the user's location.
 * @param {string} timezone - The client's timezone.
 * @returns {string} The cache key.
 */
const createStoreRequestKey = (latitude: number, longitude: number, timezone: string): string => {
    const latKey = latitude?.toString?.()?.split(".")?.[0] || '0';
    const lngKey = longitude?.toString?.()?.split(".")?.[0] || '0';
    return `storeData-${latKey}-${lngKey}-${timezone}`;
};

/**
 * Fetches the tenant configuration for a given page type with request deduplication and caching.
 * Prevents multiple concurrent API calls with the same parameters.
 * Uses LRU cache with 15-minute TTL to improve performance.
 * 
 * @param {string} pageType - The type of the page for which to fetch the configuration.
 * @param {string | undefined} token - The authorization token.
 * @returns {Promise<object>} The tenant configuration data.
 * @throws Will throw an error if the request fails.
 */
export const getPageConfig = async (pageType: string, token?: string | undefined): Promise<object> => {
    // Create cache key based on pageType and token
    const cacheKey = createPageConfigRequestKey(pageType, token);
    
    try {
        // Check if data exists in cache first
        const cachedData = pageConfigCache.get(cacheKey);
        if (cachedData) {
            return cachedData;
        }

        // Check if there's already a pending request for the same parameters
        const existingRequest = pendingPageConfigRequests.get(cacheKey);
        if (existingRequest) {
            // Wait for the existing request to complete and return its result
            return await existingRequest;
        }

        // Create new request promise
        const requestPromise = (async (): Promise<object> => {
            try {
                const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + PAGE_CONFIG_ENDPOINT, {
                    params: {
                        pageType
                    },
                    headers: {
                        'Tenant-Id': process.env.NEXT_PUBLIC_TENANT_ID || "",
                        'Cache-Control': 'public, max-age=1800',
                    }
                });
                console.log('getPageConfigWithErrorHandling', cacheKey);

                // Cache the successful response
                pageConfigCache.set(cacheKey, response.data);
                return response.data;
            } finally {
                // Always remove the pending request when done (success or failure)
                pendingPageConfigRequests.delete(cacheKey);
            }
        })();

        // Store the pending request
        pendingPageConfigRequests.set(cacheKey, requestPromise);

        // Return the promise result
        return await requestPromise;
    } catch (error) {
        // Ensure pending request is cleaned up on error
        pendingPageConfigRequests.delete(cacheKey);
        throw error;
    }
};

/**
 * Fetches the tenant store information with request deduplication and caching.
 * Prevents multiple concurrent API calls with the same parameters.
 * Uses LRU cache with 5-minute TTL to improve performance.
 * 
 * @param {number} latitude - The latitude of the user's location.
 * @param {number} longitude - The longitude of the user's location.
 * @param {string} timezone - The client's timezone.
 * @param {string} token - The authorization token.
 * @returns {Promise<object>} The tenant store data.
 * @throws Will throw an error if the request fails.
 */
export const getTenantStore = async (latitude: number, longitude: number, timezone: string, token?: string): Promise<object> => {
    // Create cache key based on latitude, longitude, and timezone (excluding token)
    const cacheKey = createStoreRequestKey(latitude, longitude, timezone);
    console.log('[TenantStore] Request started:', { cacheKey, latitude, longitude, timezone });
    
    try {
        // Check if data exists in cache first
        const cachedData = storeCache.get(cacheKey);
        if (cachedData) {
            console.log('[TenantStore] ✅ CACHE HIT:', cacheKey);
            return cachedData;
        }
        console.log('[TenantStore] ❌ CACHE MISS:', cacheKey);

        // Check if there's already a pending request for the same parameters
        const existingRequest = pendingStoreRequests.get(cacheKey);
        if (existingRequest) {
            console.log('[TenantStore] 🔄 DEDUPLICATION - Reusing existing request:', cacheKey);
            // Wait for the existing request to complete and return its result
            return await existingRequest;
        }

        console.log('[TenantStore] 🌐 Making new API request:', cacheKey);

        // Create new request promise
        const requestPromise = (async (): Promise<object> => {
            try {
                const response = await axiosClient.get(STORES_ENDPOINT, {
                    params: {
                        latitude,
                        longitude,
                        timezone,
                    },
                    headers: {
                        ...(token && { Authorization: token }),
                        'Tenant-Id': process.env.NEXT_PUBLIC_TENANT_ID || "",
                    }
                });

                // Cache the successful response
                storeCache.set(cacheKey, response.data);
                console.log('[TenantStore] 💾 Data cached successfully:', cacheKey);
                return response.data;
            } finally {
                // Always remove the pending request when done (success or failure)
                pendingStoreRequests.delete(cacheKey);
                console.log('[TenantStore] 🧹 Pending request cleaned up:', cacheKey);
            }
        })();

        // Store the pending request
        pendingStoreRequests.set(cacheKey, requestPromise);

        // Return the promise result
        return await requestPromise;
    } catch (error) {
        console.log('[TenantStore] ❌ Error:', error);
        // Ensure pending request is cleaned up on error
        pendingStoreRequests.delete(cacheKey);
        throw error;
    }
};
