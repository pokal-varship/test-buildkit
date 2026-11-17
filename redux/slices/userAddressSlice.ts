import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserAddress {
  id?: string;
  address?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  type?: string;
  hotelName?: string;
  roomNo?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface UserAddressState {
  addresses: UserAddress[];
  selectedAddressId: string | null;
  loading: boolean;
  error: string | null;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

const initialState: UserAddressState = {
  addresses: [],
  selectedAddressId: null,
  loading: false,
  error: null,
};

const userAddressSlice = createSlice({
  name: 'userAddress',
  initialState,
  reducers: {
    setAddresses(state, action: PayloadAction<UserAddress[]>) {
      state.addresses = action.payload;
    },
    addAddress(state, action: PayloadAction<UserAddress>) {
      state.addresses.push(action.payload);
    },
    updateAddress(state, action: PayloadAction<UserAddress>) {
      const index = state.addresses.findIndex(addr => addr.id === action.payload.id);
      if (index !== -1) {
        state.addresses[index] = action.payload;
      }
    },
    deleteAddress(state, action: PayloadAction<string>) {
      state.addresses = state.addresses.filter(addr => addr.id !== action.payload);
      if (state.selectedAddressId === action.payload) {
        state.selectedAddressId = null;
      }
    },
    setSelectedAddress(state, action: PayloadAction<string | null>) {
      state.selectedAddressId = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setCoordinates(state, action: PayloadAction<{ latitude: number, longitude: number }>) {
      state.coordinates = action.payload;
    },
  },
});

export const {
  setAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setSelectedAddress,
  setLoading,
  setError,
  setCoordinates,
} = userAddressSlice.actions;

export default userAddressSlice.reducer; 