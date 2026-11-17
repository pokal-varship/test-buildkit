'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    selectStoreCategories,
    selectCategoriesStoreId,
    selectCategoriesMenuSlug,
    selectStoreLoading,
    setStoreCategories,
    setError,
    setLoading
} from '@redux/slices/storeSlice';
import { getStoreCategories } from '@services/storePage';
import { Category } from '@components/type/store.types';

interface UseCategoriesResult {
    categories: {data: Category[]};
    loading: boolean;
    error: string | null;
    fetchCategories: (menuId: string, storeId: string) => Promise<void>;
}

/**
 * Custom hook to fetch and manage store categories
 * @returns Categories data, status, and fetch function
 */
const useCategories = (): UseCategoriesResult => {
    const dispatch = useDispatch();
    const categories = useSelector(selectStoreCategories);
    const categoriesStoreId = useSelector(selectCategoriesStoreId);
    const categoriesMenuSlug = useSelector(selectCategoriesMenuSlug);
    // Single source of truth: loading lives in Redux so it survives re-renders
    // and is cleared correctly even when the axios interceptor retries internally
    const loading = useSelector(selectStoreLoading);
    const [error, setLocalError] = useState<string | null>(null);

    // Guard against setting local state after component unmounts
    const isMounted = useRef(true);
    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);
    
    const fetchCategories = useCallback(async (menuId: string, storeId: string) => {
        if (!storeId) return;
        
        // Check if categories are already loaded in Redux store for the same store and menu
        const hasCategories = categories?.data && categories.data.length > 0;
        const isSameStore = categoriesStoreId === storeId;
        // Now that Redux slice handles empty string, direct comparison works
        const isSameMenu = categoriesMenuSlug === menuId;
        
        // If we already have the correct data, skip fetching
        if (hasCategories && isSameStore && isSameMenu) {
            if (isMounted.current) setLocalError(null);
            return;
        }
        
        try {
            dispatch(setLoading(true));
            const categoriesData: {data: Category[]} = await getStoreCategories(menuId, storeId);
            dispatch(setStoreCategories({ ...categoriesData, storeId, menuSlug: menuId }));
            if (isMounted.current) setLocalError(null);
        } catch (err) {
            const errorMessage = err instanceof Error
                ? err.message
                : 'Failed to fetch store categories';

            if (isMounted.current) setLocalError(errorMessage);
            dispatch(setError(errorMessage));
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch, categories?.data, categoriesStoreId, categoriesMenuSlug]);

    return {
        categories,
        loading,
        error,
        fetchCategories
    };
};

export default useCategories; 
