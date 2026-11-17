import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ProductResponse } from "@components/type/pdp.type";

interface PdpProductState {
  pdpProduct: ProductResponse | null;
}

const initialState: PdpProductState = {
  pdpProduct: null,
};

const pdpProductSlice = createSlice({
  name: "pdpProduct",
  initialState,
  reducers: {
    setPdpProduct(state, action: PayloadAction<ProductResponse | null>) {
      state.pdpProduct = action.payload;
    },
    clearPdpProduct(state) {
      state.pdpProduct = null;
    },
  },
});

export const { setPdpProduct, clearPdpProduct } = pdpProductSlice.actions;
export default pdpProductSlice.reducer;