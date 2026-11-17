import { WalletData } from '@components/type/wallet.types';
import {
    clearWallet,
    selectWallet,
    setWalletData,
    setWalletError,
    setWalletLoading,
} from '@redux/slices/walletSlice';
import { AppDispatch } from '@redux/store';
import { getWallet } from '@services/walletService';
import { useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const WALLET_STALE_MS = 60_000;

export interface FetchWalletOptions {
    page?: number;
    limit?: number;
    /** Skip cache and always refetch */
    force?: boolean;
}

export const useWallet = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { walletData, loading, error, lastFetchedAt } = useSelector(selectWallet);
    const abortControllerRef = useRef<AbortController | null>(null);
    const requestSequenceRef = useRef(0);

    const handleGetWallet = useCallback(
        async (
            userId: string,
            options: FetchWalletOptions = {}
        ): Promise<WalletData | null> => {
            if (!userId) {
                return null;
            }

            const { page = 1, limit = 1, force = false } = options;

            if (
                !force &&
                walletData &&
                lastFetchedAt &&
                Date.now() - lastFetchedAt < WALLET_STALE_MS
            ) {
                return walletData;
            }

            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            const abortController = new AbortController();
            abortControllerRef.current = abortController;
            const currentSequence = ++requestSequenceRef.current;

            dispatch(setWalletLoading(true));

            try {
                const response = await getWallet({ userId, page, limit });

                if (
                    !abortController.signal.aborted &&
                    currentSequence === requestSequenceRef.current
                ) {
                    dispatch(setWalletData(response));
                }

                return response;
            } catch (err: unknown) {
                if (
                    !abortController.signal.aborted &&
                    currentSequence === requestSequenceRef.current
                ) {
                    if (
                        (err as { name?: string })?.name !== 'AbortError' &&
                        (err as { name?: string })?.name !== 'CanceledError'
                    ) {
                        dispatch(setWalletError('Failed to fetch wallet data.'));
                    }
                }
                throw err;
            } finally {
                if (currentSequence === requestSequenceRef.current) {
                    dispatch(setWalletLoading(false));
                }
            }
        },
        [dispatch, walletData, lastFetchedAt]
    );

    const handleClearWallet = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        dispatch(clearWallet());
    }, [dispatch]);

    return {
        walletData,
        summary: walletData?.summary ?? null,
        loading,
        error,
        lastFetchedAt,
        handleGetWallet,
        handleClearWallet,
    };
};

export default useWallet;
