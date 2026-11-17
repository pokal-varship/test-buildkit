import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StoreCartData } from "../../services/storePage";
import { CartTotalSummary } from "@components/order/order.type";

export interface CartState {
    cartData: StoreCartData | null;
    loading: boolean;
    error: string | null; // Use string insted of SerializedError for simplicity
}

const initialState: CartState = {
    cartData: null,
    loading: false,
    error: null,
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        setCartData: (state, action: PayloadAction<StoreCartData | null>) => {
            state.cartData = action.payload;
            state.loading = false;
            state.error = null;
        },
        setCartLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setCartError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            state.loading = false;
        },
        updateCartTip: (state, action: PayloadAction<number>) => {
            if (!state.cartData?.data?.total) return;
            const currentTotal = state.cartData.data.total as unknown as CartTotalSummary;
            const previousTip = currentTotal?.tipAmount || 0;
            const newTip = action?.payload || 0;
            const tipDelta = newTip - previousTip;
            // Ensure tipAmount exists and update it
            (state.cartData.data.total as unknown as CartTotalSummary).tipAmount = newTip;
            // Adjust finalAmount optimistically by the delta
            currentTotal.finalAmount = Math.max(0, (currentTotal?.finalAmount || 0) + tipDelta);
        },
        updateItemQuantity: (state, action: PayloadAction<{ itemId: string; type: 'increment' | 'decrement' }>) => {
            if (state.cartData?.data?.items) {
                const item = state.cartData.data.items.find(item => item.id === action.payload.itemId);
                if (item) {
                    if (action.payload.type === 'increment') {
                        item.quantity += 1;
                    } else {
                        item.quantity = Math.max(1, item.quantity - 1);
                    }
                }
            }
        },
        setItemQuantity: (state, action: PayloadAction<{ itemId: string; quantity: number }>) => {
            if (state.cartData?.data?.items) {
                const item = state.cartData.data.items.find(item => item.id === action.payload.itemId);
                if (item) {
                    item.quantity = Math.max(0, action.payload.quantity);
                }
            }
        },
        setCartOrderType: (state, action: PayloadAction<string>) => {
            if (state.cartData) {
                state.cartData.data.orderType = action.payload;
            }
        },
        clearCart: (state) => {
            state.cartData = null;
            state.loading = false;
            state.error = null;
        },
    },
});

export const { setCartData, setCartLoading, setCartError, updateCartTip, updateItemQuantity, setItemQuantity, setCartOrderType, clearCart } = cartSlice.actions;

// Use RootState instead of `any` for better type safety
export const selectCart = (state: { cart: CartState }) => state.cart;

export default cartSlice.reducer;
