/**
 * Redux slice for product search state
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { TypesenseSearchParams } from '@services/typesense/types';

interface ProductSearchState {
  searchParams: TypesenseSearchParams;
  storeId: string;
  isSearching: boolean;
}

const initialState: ProductSearchState = {
  searchParams: {
    q: '',
    query_by: 'name,description',
    per_page: 20,
    page: 1,
  },
  storeId: process.env.NEXT_PUBLIC_TENANT_ID || "",
  isSearching: false,
};

const productSearchSlice = createSlice({
  name: 'productSearch',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchParams.q = action.payload;
    },
    setSearchParams: (state, action: PayloadAction<Partial<TypesenseSearchParams>>) => {
      state.searchParams = { ...state.searchParams, ...action.payload };
    },
    setStoreId: (state, action: PayloadAction<string>) => {
      state.storeId = action.payload;
    },
    setIsSearching: (state, action: PayloadAction<boolean>) => {
      state.isSearching = action.payload;
    },
    resetSearch: (state) => {
      state.searchParams = initialState.searchParams;
    },
  },
});

export const {
  setSearchQuery,
  setSearchParams,
  setStoreId,
  setIsSearching,
  resetSearch,
} = productSearchSlice.actions;

export const selectSearchParams = (state: RootState) => state.productSearch.searchParams;
export const selectStoreId = (state: RootState) => state.productSearch.storeId;
export const selectIsSearching = (state: RootState) => state.productSearch.isSearching;

export default productSearchSlice.reducer;