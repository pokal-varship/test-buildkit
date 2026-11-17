import { ReorderProduct } from "@components/orderagain/orderAgainType";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ReorderState {
  // Cache key format: `${storeSlug}-${menuSlug || 'all'}`
  cache: Record<string, {
    products: ReorderProduct[];
    timestamp: number;
    isLoading: boolean;
    error: string | null;
  }>;
  // Cache expiration time in milliseconds (5 minutes)
  cacheExpiration: number;
}

const initialState: ReorderState = {
  cache: {},
  cacheExpiration: 5 * 60 * 1000, // 5 minutes
};

const reorderSlice = createSlice({
  name: "reorder",
  initialState,
  reducers: {
    setReorderLoading: (state, action: PayloadAction<{ storeSlug: string; menuSlug?: string; loading: boolean }>) => {
      const { storeSlug, menuSlug, loading } = action.payload;
      const cacheKey = `${storeSlug}-${menuSlug || 'all'}`;
      
      if (!state.cache[cacheKey]) {
        state.cache[cacheKey] = {
          products: [],
          timestamp: 0,
          isLoading: false,
          error: null,
        };
      }
      
      // Only set loading to true if not already loading to prevent multiple simultaneous calls
      if (loading && !state.cache[cacheKey].isLoading) {
        state.cache[cacheKey].isLoading = loading;
      } else if (!loading) {
        state.cache[cacheKey].isLoading = loading;
      }
    },
    
    setReorderProducts: (state, action: PayloadAction<{ storeSlug: string; menuSlug?: string; products: ReorderProduct[] }>) => {
      const { storeSlug, menuSlug, products } = action.payload;
      const cacheKey = `${storeSlug}-${menuSlug || 'all'}`;
      
      state.cache[cacheKey] = {
        products,
        timestamp: Date.now(),
        isLoading: false,
        error: null,
      };
    },
    
    setReorderError: (state, action: PayloadAction<{ storeSlug: string; menuSlug?: string; error: string }>) => {
      const { storeSlug, menuSlug, error } = action.payload;
      const cacheKey = `${storeSlug}-${menuSlug || 'all'}`;
      
      if (!state.cache[cacheKey]) {
        state.cache[cacheKey] = {
          products: [],
          timestamp: 0,
          isLoading: false,
          error: null,
        };
      }
      
      state.cache[cacheKey].isLoading = false;
      state.cache[cacheKey].error = error;
    },
    
    clearReorderCache: (state) => {
      state.cache = {};
    },
    
    clearExpiredReorderCache: (state) => {
      const now = Date.now();
      Object.keys(state.cache).forEach(key => {
        if (now - state.cache[key].timestamp > state.cacheExpiration) {
          delete state.cache[key];
        }
      });
    },
  },
});

export const {
  setReorderLoading,
  setReorderProducts,
  setReorderError,
  clearReorderCache,
  clearExpiredReorderCache,
} = reorderSlice.actions;

// Selectors
export const selectReorderProducts = (state: { reorder: ReorderState }, storeSlug: string, menuSlug?: string) => {
  const cacheKey = `${storeSlug}-${menuSlug || 'all'}`;
  const cacheEntry = state.reorder.cache[cacheKey];
  
  if (!cacheEntry) {
    return {
      products: [],
      isLoading: false,
      error: null,
      isCached: false,
    };
  }
  
  const isExpired = Date.now() - cacheEntry.timestamp > state.reorder.cacheExpiration;
  
  return {
    products: cacheEntry.products,
    isLoading: cacheEntry.isLoading,
    error: cacheEntry.error,
    isCached: !isExpired && cacheEntry.products.length > 0,
  };
};

export const selectIsReorderLoading = (state: { reorder: ReorderState }, storeSlug: string, menuSlug?: string) => {
  const cacheKey = `${storeSlug}-${menuSlug || 'all'}`;
  return state.reorder.cache[cacheKey]?.isLoading || false;
};

export default reorderSlice.reducer;
