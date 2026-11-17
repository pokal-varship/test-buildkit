import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Store, Category } from '@components/type/store.types';

// Define types for the store state
interface StoreState {
  currentStore: Store | null;
  loading: boolean;
  error: string | null;
  storeCategories: { data: Category[]; menuSlug?: string };
  storeId: string | null;
  categoriesStoreId: string | null; // Track which store's categories are loaded
  categoriesMenuSlug: string | null;
}

// Initial state
const initialState: StoreState = {
  currentStore: null,
  loading: false,
  error: null,
  storeCategories: { data: [] },
  storeId: null,
  categoriesStoreId: null,
  categoriesMenuSlug: null,
};

// Create the slice
const storeSlice = createSlice({
  name: 'store',
  initialState,
  reducers: {
    setCurrentStore: (state, action: PayloadAction<Store>) => {
      state.currentStore = action.payload;
      state.error = null;
    },
    clearCurrentStore: (state) => {
      state.currentStore = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setStoreCategories: (state, action: PayloadAction<{ data: Category[]; storeId?: string; menuSlug?: string }>) => {
      state.storeCategories = action.payload;
      if (action.payload.storeId) {
        state.categoriesStoreId = action.payload.storeId;
      }
      // Handle empty string menuSlug (for "all-day" case where menuSlug is "")
      if (action.payload.menuSlug !== undefined) {
        state.categoriesMenuSlug = action.payload.menuSlug;
      }
    },
    clearStoreCategories: (state) => {
      state.storeCategories = { data: [] };
      state.categoriesStoreId = null;
      state.categoriesMenuSlug = null;
    },
    setStoreId: (state, action: PayloadAction<string>) => {
      state.storeId = action.payload;
    },
  },
});

// Export actions and reducer
export const {
  setCurrentStore,
  clearCurrentStore,
  setLoading,
  setError,
  setStoreCategories,
  clearStoreCategories,
  setStoreId
} = storeSlice.actions;

// Export selectors
export const selectCurrentStore = (state: RootState) => state.store.currentStore;
export const selectStoreLoading = (state: RootState) => state.store.loading;
export const selectStoreError = (state: RootState) => state.store.error;
export const selectStoreCategories = (state: RootState) => state.store.storeCategories;
export const selectCategoriesStoreId = (state: RootState) => state.store.categoriesStoreId;
export const selectCategoriesMenuSlug = (state: RootState) => state.store.categoriesMenuSlug;

export default storeSlice.reducer; 