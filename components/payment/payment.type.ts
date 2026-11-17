export interface PaymentResponse {
    orderId: string;
    paymentStatus: string;
    transactionId: string;
    reason: string;
}

export interface ApiErrorResponse {
    response?: {
        data?: {
            message: string;
        };
    };
}