import { useState, useCallback } from 'react';
import { getFreebiesOffer } from '@services/freebies';

interface UseFreebiesOfferReturn<TData> {
    getFreebiesOffer: (
        storeId: string,
        identifier: string,
        offerId?: string,
        identifierKey?: "cartId" | "sessionId"
    ) => Promise<TData | null>;
    isLoading: boolean;
    error: string | null;
    freebiesData: TData | null;
}

export const useFreebiesOffer = <TData = unknown>(): UseFreebiesOfferReturn<TData> => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [freebiesData, setFreebiesData] = useState<TData | null>(null);

    const getFreebiesOfferData = useCallback(async (
        storeId: string,
        identifier: string,
        offerId?: string,
        identifierKey: "cartId" | "sessionId" = "cartId"
    ) => {
        if (!storeId || !identifier) {
            setError('Store ID and Cart/Session ID are required');
            return null;
        }

        try {
            setIsLoading(true);
            setError(null);

            const response = await getFreebiesOffer(storeId, identifier, offerId, identifierKey) as unknown;
            // Backwards-compatible unwrap: older code expected the payload at response.data
            const payload = (response as { data?: unknown } | null | undefined)?.data ?? response;
            setFreebiesData((payload ?? null) as TData | null);
            return (payload ?? null) as TData | null;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error fetching freebies offer';
            setError(errorMessage);

            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        getFreebiesOffer: getFreebiesOfferData,
        isLoading,
        error,
        freebiesData
    };
}; 