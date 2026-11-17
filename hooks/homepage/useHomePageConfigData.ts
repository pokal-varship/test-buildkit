'use client';

import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@redux/store";
import {
    setPageConfigData,
    setConfigLoading,
    setConfigError,
} from "@redux/slices/homePageSlice";

const useHomePageConfigData = () => {
    const dispatch = useDispatch<AppDispatch>();
    const {
        pageConfigData,
        configLoading,
        configError,
    } = useSelector((state: RootState) => state.homePage);
    const isFetching = useRef(false);

    const fetchPageConfigData = async (): Promise<void> => {
        // Prevent multiple calls: if data exists or already fetching, return early
        if (pageConfigData || configLoading || isFetching.current) {
            return;
        }
        
        isFetching.current = true;
        dispatch(setConfigLoading(true));
        try {
            // Fetch from local API route to avoid CORS issues
            const response = await fetch('/api/homepage-config');
            const result = await response.json();
            if (result.data) {
                dispatch(setPageConfigData(result.data));
            } else {
                throw new Error(result.error || 'No data received');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to fetch page config data";
            dispatch(setConfigError(errorMessage));

        } finally {
            dispatch(setConfigLoading(false));
            isFetching.current = false;
        }
    };

    return {
        pageConfigData,
        configLoading,
        configError,
        fetchPageConfigData,
    };
};

export default useHomePageConfigData;
