'use client';

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTenantStore } from "@services/homePage";
import { RootState, AppDispatch } from "@redux/store";
import {
    setError,
    setLoading,
    setStoreData,
} from "@redux/slices/homePageSlice";
import { Store } from "@components/type/store.types";

interface StoreResponse {
    data: Store[];
}

/**
 * Custom hook to fetch and manage homepage store data on the client side.
 * Config data should be fetched separately on the server side.
 * 
 * @returns {object} Store data, loading state, error message, and refetch method
 */
const useHomePageData = (latitude: number, longitude: number, timezone: string) => {
    const dispatch = useDispatch<AppDispatch>();
    const {
        storeData,
        loading,
        error,
    } = useSelector((state: RootState) => state.homePage);
    const initData = useRef(false);
    const fetchingRef = useRef(false);
    const lastFetchParamsRef = useRef<string>('');

    /**
     * Fetches store data from the API
     */
    const fetchStoreData = async (): Promise<void> => {
        // Prevent concurrent fetches
        if (fetchingRef.current) {
            return;
        }

        const currentParams = `${latitude},${longitude}`;
        
        // Set loading state appropriately
        const shouldShowLoading = !storeData?.data?.length || !initData.current;
        dispatch(setLoading(shouldShowLoading));
        
        fetchingRef.current = true;
        
        try {
            // Clear any previous errors
            dispatch(setError(null));
            
            const data = await getTenantStore(latitude, longitude, timezone) as StoreResponse;
            
            // Validate data before dispatching
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid response format from API');
            }
            
            // Always dispatch the fetched data to Redux store
            dispatch(setStoreData(data));
            
            if (data?.data?.length > 0) {
                initData.current = true;
                lastFetchParamsRef.current = currentParams;
            }
            
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to fetch store data";
            dispatch(setError(errorMessage));

        } finally {
            dispatch(setLoading(false));
            fetchingRef.current = false;
        }
    };

    // Fetch store data when location changes
    useEffect(() => {
        if (latitude && longitude) {
            const currentParams = `${latitude},${longitude}`;
            
            // Only fetch if location has changed or no data exists
            if (currentParams !== lastFetchParamsRef.current || !initData.current) {
                fetchStoreData();
            }
        }
    }, [latitude, longitude]);

    // Manual refetch function that clears cache
    const refetchStore = async (): Promise<void> => {
        initData.current = false;
        lastFetchParamsRef.current = '';
        await fetchStoreData();
    };

    return {
        // Store data (client-side)
        storeData,
        loading,
        error,
        refetchStore,
    };
};

export default useHomePageData;
