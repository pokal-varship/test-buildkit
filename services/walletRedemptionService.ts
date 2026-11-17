import { WalletRedemptionPreviewPayload } from '@components/type/walletRedemption.types';
import {
    WALLET_REDEMPTION_PREVIEW_ENDPOINT,
    LOYALTY_CONVERT_POINTS_TO_CASH_ENDPOINT,
} from '@config/api.config';
import axiosClient from './axios';

export const previewWalletRedemption = async (
    payload: WalletRedemptionPreviewPayload
) => {
    const response = await axiosClient.post(
        WALLET_REDEMPTION_PREVIEW_ENDPOINT,
        payload
    );
    return response.data;
};

export const convertPointsToCash = async (payload: {
    tenantId: string;
    points: number;
}): Promise<{
    data: {
        cashAmount: number;
        points: number;
        pointsPerCurrency: number;
        tenantId: string;
    };
}> => {
    const response = await axiosClient.post(
        LOYALTY_CONVERT_POINTS_TO_CASH_ENDPOINT,
        payload
    );
    return response.data;
};
