import { RESERVED_ROUTES } from '@config/routes.config';
import { Store } from '@components/type/store.types';
import { getTenantStore } from './homePage';
import { getCookie } from '@lib/cookie';
import { resolveTimezone } from '@lib/helper';

/**
 * Default coordinates for fetching stores when no location is available.
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
 * Gets coordinates from browser cookies or returns defaults.
 * Uses client-side cookie utility (not next/headers).
 */
const getCoordinatesFromCookiesClient = (): {
    latitude: number;
    longitude: number;
    timezone: string;
} => {
    try {
        const latitude = Number(getCookie('lattitude')) || DEFAULT_COORDINATES.latitude;
        const longitude = Number(getCookie('longitude')) || DEFAULT_COORDINATES.longitude;
        const timezone = resolveTimezone(
            getCookie('client_timezone'),
            DEFAULT_COORDINATES.timezone,
        );
        
        return { latitude, longitude, timezone };
    } catch {
        // Cookies not available
        return {
            ...DEFAULT_COORDINATES,
            timezone: resolveTimezone(undefined, DEFAULT_COORDINATES.timezone),
        };
    }
};

/**
 * Client-safe function to get store ID by slug.
 * Uses coordinates from cookies and works in browser environment.
 * Does NOT use next/headers cookies.
 * 
 * @param {string} slug - The store slug
 * @returns {Promise<string | null>} The store ID or null if not found
 */
export const getStoreIdBySlugClient = async (slug: string): Promise<string | null> => {
    if (!slug || RESERVED_ROUTES.includes(slug) || slug.includes('.')) {
        return null;
    }

    try {
        const { latitude, longitude, timezone } = getCoordinatesFromCookiesClient();
        
        const response = await getTenantStore(
            latitude,
            longitude,
            timezone
        ) as StoreApiResponse;

        const stores: Store[] = response?.data || [];
        const store = stores.find(s => s.slug === slug);
        
        return store?.id || null;
    } catch (error) {
        console.error('[StoreService] Error fetching store ID by slug (client):', error);
        return null;
    }
};
