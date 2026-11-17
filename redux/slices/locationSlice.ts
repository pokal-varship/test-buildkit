import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserAddress } from 'types/userAddress.types';




interface LocationState {
    latitude: number | null;
    longitude: number | null;
    userAddress: UserAddress | null | string | { [key: string]: string};
}

const initialState: LocationState = {
    latitude: null,
    longitude: null,
    userAddress: null,
};

const locationSlice = createSlice({
    name: 'location',
    initialState,
    reducers: {
        setLocation(state, action: PayloadAction<{ latitude: number; longitude: number }>) {
            state.latitude = action.payload.latitude;
            state.longitude = action.payload.longitude;
        },
        setUserAddress(state, action: PayloadAction<UserAddress | null | string | { [key: string]: string}>) {
            state.userAddress = action.payload;
        },

        clearUserAddress(state) {
            state.userAddress = null;
        },
    },
});

export const { setLocation, setUserAddress, clearUserAddress } = locationSlice.actions;
export default locationSlice.reducer; 
