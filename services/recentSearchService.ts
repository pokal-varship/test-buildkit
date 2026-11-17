import { SEARCH_INPUT_SUGGESTIONS_ENDPOINT } from '@config/api.config';
import axiosClient from './axios';

export interface RecentSearchPayload {
    searchQuery: string;
    menuId?: string;
}

export interface RecentSearchItem {
    id: string;
    searchQuery: string;
    menuId?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface RecentSearchResponse {
    data?: RecentSearchItem[];
    message?: string;
    success?: boolean;
    [key: string]: unknown;
}

/**
 * Posts a recent search to the API.
 * @param payload The search payload containing searchQuery and menuId
 * @param storeId The store ID for the request
 * @returns The API response
 */
export const postRecentSearch = async (
    payload: RecentSearchPayload,
    storeId: string,
): Promise<RecentSearchResponse> => {
    try {
        const response = await axiosClient.post(
            SEARCH_INPUT_SUGGESTIONS_ENDPOINT,
            payload,
            {
                headers: {
                    'Store-Id': storeId,
                }
            }
        );
        return response.data;
    } catch (error) {

        throw error;
    }
};

/**
 * Gets recent search suggestions from the API.
 * @param params The query parameters for the GET request
 * @param storeId The store ID for the request
 * @returns The API response
 */
export const getRecentSearchSuggestions = async (
    params: {
        skip?: number;
        limit?: number;
        menuId?: string | null;
        q?: string;
    },
    storeId: string,
): Promise<RecentSearchResponse> => {
    try {
        const response = await axiosClient.get(
            SEARCH_INPUT_SUGGESTIONS_ENDPOINT,
            {
                params: {
                    skip: params.skip ?? 0,
                    limit: params.limit ?? 10,
                    menuId: params.menuId ?? null,
                    // q: params.q ?? ''
                },
                headers: {
                    'Store-Id': storeId,
                }
            }
        );
        return response.data;
    } catch (error) {

        throw error;
    }
}

export const deleteRecentSearch = async (
    storeId: string,
    id: string,
): Promise<RecentSearchResponse> => {
    try {
        const response = await axiosClient.delete(
            `${SEARCH_INPUT_SUGGESTIONS_ENDPOINT}?id=${id}`,
            {
                headers: {
                    'Store-Id': storeId,
                }
            }
        );
        return response.data;
    } catch (error) {

        throw error;
    }
};