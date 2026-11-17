export interface WalletRedemptionPreviewPayload {
    userId: string;
    tenantId: string;
    redemptionType: number[];
    currency: string;
    orderAmount: number;
    amount?: number;
    pointsAmount?: number;
}
