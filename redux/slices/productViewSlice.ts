import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

export type ViewMode = 'grid' | 'list';

interface ProductViewState {
  viewMode: ViewMode;
}

const initialState: ProductViewState = {
  viewMode: 'grid', // Default view mode is grid
};

const productViewSlice = createSlice({
  name: 'productView',
  initialState,
  reducers: {
    setViewMode: (state, action: PayloadAction<ViewMode>) => {
      state.viewMode = action.payload;
    },
  },
});

export const { setViewMode } = productViewSlice.actions;

export const selectViewMode = (state: RootState) => state.productView.viewMode;

export default productViewSlice.reducer;