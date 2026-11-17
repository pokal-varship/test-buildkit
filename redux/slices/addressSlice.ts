import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AddressState {
    address: string | null;
}

const initialState: AddressState = {
    address: null,
};

const addressSlice = createSlice({
    name: 'address',
    initialState,
    reducers: {
        setStoreAddress(state, action: PayloadAction<string>) {
            state.address = action.payload;
        },
        clearStoreAddress(state) {
            state.address = null;
        },
    },
});

export const { setStoreAddress, clearStoreAddress } = addressSlice.actions;
export default addressSlice.reducer; 