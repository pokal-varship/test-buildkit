import { useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectCart, setCartData, setCartLoading, setCartError } from "../../redux/slices/cartSlice";
import { AppDispatch } from "../../redux/store";
import { StoreCartData } from "@services/storePage";
import { getStoreCart } from "@services/cartService";
import { selectQrFlow } from "../../redux/slices/qrFlowSlice";

export const useStoreCart = () => {
    const dispatch: AppDispatch = useDispatch();
    const { cartData, loading, error } = useSelector(selectCart);
    const isQrFlow = useSelector(selectQrFlow);
    const abortControllerRef = useRef<AbortController | null>(null);
    const requestSequenceRef = useRef<number>(0);

    const handleGetCart = useCallback(async (storefrontId: string, requestSequence?: number): Promise<StoreCartData> => {
        if (isQrFlow) {
            return (cartData ?? {}) as unknown as StoreCartData;
        }

        // Cancel any pending request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create new abort controller for this request
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        // Increment and track request sequence
        const currentSequence = requestSequence ?? ++requestSequenceRef.current;

        // dispatch(setCartLoading(true));
        try {
            const response = await getStoreCart(storefrontId);
            
            // Only update state if this is still the latest request
            if (!abortController.signal.aborted && currentSequence === requestSequenceRef.current) {
                dispatch(setCartData(response as unknown as StoreCartData));
            }
            
            // Return/resolve the response
            return response as unknown as StoreCartData;
        } catch (err: unknown) {
            // Only update error if this is still the latest request and not aborted
            if (!abortController.signal.aborted && currentSequence === requestSequenceRef.current) {
                // Ignore abort errors (they're expected when canceling stale requests)
                if ((err as { name?: string })?.name !== 'AbortError' && (err as { name?: string })?.name !== 'CanceledError') {
                    dispatch(setCartError("Failed to fetch cart data."));
                }
            }
            
            // Reject with the error
            throw err;
        } finally {
            // Only clear loading if this is still the latest request
            if (currentSequence === requestSequenceRef.current) {
                dispatch(setCartLoading(false));
            }
        }
    }, [isQrFlow, cartData]); // eslint-disable-line react-hooks/exhaustive-deps

    return { cartData, loading, error, handleGetCart };
};
