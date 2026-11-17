import { useEffect, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getReorderProducts } from "@services/reorderService";
import { RootState } from "@redux/store";
import {
  setReorderLoading,
  setReorderProducts,
  setReorderError,
  selectReorderProducts,
  clearExpiredReorderCache,
} from "@redux/slices/reorderSlice";
import { useAuth } from "./useAuth";
import { getCookie } from "@lib/cookie";

type UseReorderProductsOptions = {
  /** When false, no network request and empty products are returned (e.g. QR dine-in full menu). */
  enabled?: boolean;
};

export const useReorderProducts = (
  storeSlug: string,
  menuSlug?: string,
  options?: UseReorderProductsOptions
) => {
  const enabled = options?.enabled !== false;
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const { products, isLoading: loading, error, isCached } = useSelector(
    (state: RootState) => selectReorderProducts(state, storeSlug, menuSlug)
  );

  // ✅ Prevent duplicate API calls (StrictMode double mount)
  const didFetch = useRef(false);
  
  // Get current user token to track changes
  const userToken = getCookie("token");

  const fetchProducts = useCallback(async () => {
    if (!storeSlug) {
      dispatch(
        setReorderError({
          storeSlug,
          menuSlug,
          error: "Store slug is required",
        })
      );
      return;
    }

    try {
      dispatch(setReorderLoading({ storeSlug, menuSlug, loading: true }));
      const response = await getReorderProducts(storeSlug, menuSlug);
      
      // Ensure response is an array
      const products = Array.isArray(response) ? response : [];
      
      dispatch(
        setReorderProducts({
          storeSlug,
          menuSlug,
          products,
        })
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch reorder products";
      dispatch(setReorderError({ storeSlug, menuSlug, error: errorMessage }));
      
      // Set empty array on error to prevent map errors
      dispatch(
        setReorderProducts({
          storeSlug,
          menuSlug,
          products: [],
        })
      );
    }
  }, [dispatch, storeSlug, menuSlug]);

  useEffect(() => {
    dispatch(clearExpiredReorderCache());

    if (!enabled) {
      return;
    }

    // Fetch reorder products
    if (storeSlug && isAuthenticated && !isCached && !loading && !didFetch.current) {
      didFetch.current = true; // ✅ ensure fetch only once
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch once per store/menu/auth/enabled; isCached/loading read for guard only
  }, [storeSlug, menuSlug, isAuthenticated, enabled]);

  const refetch = () => {
    if (!enabled) {
      return;
    }
    didFetch.current = false; // allow manual refetch
    fetchProducts();
  };

  return {
    products: enabled ? products : [],
    loading: enabled ? loading : false,
    error: enabled ? error : null,
    refetch,
    isAuthenticated, // Expose authentication status
  };
};
