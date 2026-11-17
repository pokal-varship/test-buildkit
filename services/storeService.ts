import { RESERVED_ROUTES } from '@config/routes.config';
import { Store } from '@components/type/store.types';
import { getTenantStore } from './homePage';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { resolveTimezone } from '@lib/helper';

/**
 * Default coordinates for fetching stores when no location is available.
 * These are used as fallback when cookies don't have location data.
 */
const DEFAULT_COORDINATES = {
    latitude: 21.1959,
    longitude: 72.8302,
    timezone: 'Asia/Calcutta'
};

/**
 * Response type from getTenantStore API
 */
interface StoreApiResponse {
    data?: Store[];
    status?: string;
    message?: string;
    totalCount?: number;
}

/**
 * Gets coordinates from cookies or returns defaults.
 * Follows the same pattern as layout.tsx
 */
const getCoordinatesFromCookies = async (): Promise<{
    latitude: number;
    longitude: number;
    timezone: string;
}> => {
    try {
        const cookieStore = await cookies();
        const latitude = Number(cookieStore?.get('lattitude')?.value) || DEFAULT_COORDINATES.latitude;
        const longitude = Number(cookieStore?.get('longitude')?.value) || DEFAULT_COORDINATES.longitude;
        const timezone = resolveTimezone(
            cookieStore?.get('client_timezone')?.value,
            DEFAULT_COORDINATES.timezone,
        );
        
        return { latitude, longitude, timezone };
    } catch {
        // Cookies not available (e.g., during static generation)
        return {
            ...DEFAULT_COORDINATES,
            timezone: resolveTimezone(undefined, DEFAULT_COORDINATES.timezone),
        };
    }
};

/**
 * Internal function to fetch stores - wrapped with React cache for request-level deduplication.
 * This ensures that multiple calls to getStoreSlugs within the same request reuse the same data.
 */
const fetchStoresInternal = cache(async (
    latitude: number,
    longitude: number,
    timezone: string,
    token?: string
): Promise<{ slugs: string[]; stores: Store[] }> => {
    try {
        const response = await getTenantStore(
            latitude,
            longitude,
            timezone,
            token
        ) as StoreApiResponse;

        const stores: Store[] = response?.data || [];
        const slugs = stores.map(store => store.slug).filter(Boolean);
        
        return { slugs, stores };
    } catch (error) {
        console.error('[StoreService] Error fetching store slugs:', error);
        return { slugs: [], stores: [] };
    }
});

/**
 * Fetches all stores and returns their slugs.
 * Reuses the existing getTenantStore function which already has caching and deduplication.
 * Uses coordinates from cookies when available, otherwise uses defaults.
 * Uses React cache for request-level deduplication to prevent multiple API calls.
 * 
 * @param {string} [token] - Optional authorization token
 * @returns {Promise<{ slugs: string[]; stores: Store[] }>} Object containing store slugs and store data
 */
export const getStoreSlugs = async (token?: string): Promise<{ slugs: string[]; stores: Store[] }> => {
    const { latitude, longitude, timezone } = await getCoordinatesFromCookies();
    return fetchStoresInternal(latitude, longitude, timezone, token);
};

/**
 * Validates if a given slug is a valid store slug.
 * Checks against reserved routes and validates against store API.
 * 
 * @param {string} slug - The slug to validate
 * @param {string} [token] - Optional authorization token
 * @returns {Promise<{ isValid: boolean; store?: Store }>} Validation result with store data if valid
 */
export const validateStoreSlug = async (
    slug: string, 
    token?: string
): Promise<{ isValid: boolean; store?: Store }> => {
    // First check: Not a reserved route
    if (RESERVED_ROUTES.includes(slug)) {
        return { isValid: false };
    }

    // Second check: Contains dots (invalid slug pattern)
    if (slug.includes('.')) {
        return { isValid: false };
    }

    try {
        const { slugs, stores } = await getStoreSlugs(token);
        const storeIndex = slugs.indexOf(slug);
        
        if (storeIndex !== -1) {
            return { 
                isValid: true, 
                store: stores[storeIndex] 
            };
        }
        
        return { isValid: false };
    } catch (error) {
        console.error('[StoreService] Error validating store slug:', error);
        return { isValid: false };
    }
};

/**
 * Gets a store by its slug.
 * 
 * @param {string} slug - The store slug
 * @param {string} [token] - Optional authorization token
 * @returns {Promise<Store | null>} The store data or null if not found
 */
export const getStoreBySlug = async (
    slug: string, 
    token?: string
): Promise<Store | null> => {
    const { isValid, store } = await validateStoreSlug(slug, token);
    return isValid ? (store || null) : null;
};

