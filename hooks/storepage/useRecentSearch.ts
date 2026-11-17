import { useState, useCallback, useEffect } from 'react';
import { postRecentSearch, RecentSearchPayload, RecentSearchResponse } from '@services/recentSearchService';
import { getRecentSearchSuggestions } from '@services/recentSearchService';

interface UseRecentSearchResult {
    loading: boolean;
    error: string | null;
    recentData: RecentSearchResponse | null;
    triggerRecentSearch: (payload: RecentSearchPayload, storeId: string, token?: string) => Promise<void>;
    fetchRecentSearchSuggestions: (
        params: {
            skip?: number;
            limit?: number;
            menuId?: string | null;
            q?: string;
        },
        storeId: string,
    ) => Promise<void>;
}

/**
 * Custom hook to post recent search data to the API.
 * @returns Loading, error, data, and a trigger function
 */
const useRecentSearch = (menuId: string, q: string, storeId: string): UseRecentSearchResult => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recentData, setRecentData] = useState<RecentSearchResponse | null>(null);

    const triggerRecentSearch = useCallback(
        async (payload: RecentSearchPayload, storeId: string) => {
            setLoading(true);
            setError(null);
            try {
                await postRecentSearch(payload, storeId);
            } catch (err: any) {
                setError(err?.message || 'Failed to post recent search');
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const fetchRecentSearchSuggestions = useCallback(
        async (
            params: {
                skip?: number;
                limit?: number;
                menuId?: string | null;
                q?: string;
            },
            storeId: string,
        ) => {
            setLoading(true);
            setError(null);
            try {
                const response = await getRecentSearchSuggestions(params, storeId);
                setRecentData(response);
            } catch (err: any) {
                setError(err?.message || 'Failed to fetch recent search suggestions');
            } finally {
                setLoading(false);
            }
        },
        []
    );

    // Remove the automatic useEffect that was causing duplicate API calls
    // The API will now only be called when explicitly requested through fetchRecentSearchSuggestions

    return {
        loading,
        error,
        recentData,
        triggerRecentSearch,
        fetchRecentSearchSuggestions
    };
};
export default useRecentSearch;