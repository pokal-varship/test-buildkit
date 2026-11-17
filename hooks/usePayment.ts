import { useState } from 'react';
import axios from 'axios';
import { PAYMENT_INTENT_ENDPOINT, PAYMENT_WEBHOOK_ENDPOINT } from '@config/api.config';
import axiosClient from '@services/axios';
import { PaymentResponse } from '@components/payment/payment.type';

interface PaymentIntentResponse {
    client_secret: string;
    amount: number;
    message: string;
    customerSessionClientSecret: string;
}

export const usePayment = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createPaymentIntent = async (orderId: string, storeId: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await axiosClient.post<PaymentIntentResponse>(
                `${PAYMENT_INTENT_ENDPOINT}`,
                {
                    orderId,
                },
                {
                    headers: {
                        'Store-Id': storeId,
                    },
                }
            );

            return response.data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create payment intent');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const cancelPaymentIntent = async (payload: PaymentResponse) => {
        try {
            const response = await axiosClient.post<PaymentIntentResponse>(
                `${PAYMENT_WEBHOOK_ENDPOINT}`,
                payload,
            );

            return response.data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create payment webhook');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }

    return {
        createPaymentIntent,
        cancelPaymentIntent,
        isLoading,
        error,
    };
}; 
