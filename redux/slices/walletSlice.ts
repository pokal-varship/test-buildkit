import { WalletData } from '@components/type/wallet.types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WalletState {
    walletData: WalletData | null;
    loading: boolean;
    error: string | null;
    lastFetchedAt: number | null;
}

const initialState: WalletState = {
    walletData: null,
    loading: false,
    error: null,
    lastFetchedAt: null,
};

const walletSlice = createSlice({
    name: 'wallet',
    initialState,
    reducers: {
        setWalletData: (state, action: PayloadAction<WalletData | null>) => {
            state.walletData = action.payload;
            state.loading = false;
            state.error = null;
            state.lastFetchedAt = action.payload ? Date.now() : null;
        },
        setWalletLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setWalletError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            state.loading = false;
        },
        clearWallet: (state) => {
            state.walletData = null;
            state.loading = false;
            state.error = null;
            state.lastFetchedAt = null;
        },
    },
});

export const { setWalletData, setWalletLoading, setWalletError, clearWallet } = walletSlice.actions;

export const selectWallet = (state: { wallet: WalletState }) => state.wallet;

export const selectWalletSummary = (state: { wallet: WalletState }) =>
    state.wallet.walletData?.summary ?? null;

export default walletSlice.reducer;
