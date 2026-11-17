import { useState } from 'react';
import { checkout } from '@services/checkOutService';
import { CheckoutPayload } from '@components/checkOut/checkout.type';
import { getPlacedOrderId } from '@lib/payment/orderCheckout';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@redux/store';
import { setOrderId } from '@redux/slices/ordersSlice';
import { useSearchParams } from 'next/navigation';

export const useCheckout = () => {
    const searchParams = useSearchParams();
    const store = useSelector((state: RootState) => state.store);
    const dispatch = useDispatch();
    const storefrontId = store?.currentStore?.id || searchParams?.get("storeId");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const placeOrder = async (payload: CheckoutPayload) => {

        try {
            setIsLoading(true);
            setError(null);

            const response = await checkout(storefrontId as string, payload);

            const placedOrderId = getPlacedOrderId(
                response?.data as Record<string, unknown>
            );
            if (placedOrderId) {
                dispatch(setOrderId(placedOrderId));
            }
            return response;
        } catch (error) {
            setError(error instanceof Error ? error.message : 'An error occurred during checkout');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        placeOrder,
        isLoading,
        error
    };
}; 
