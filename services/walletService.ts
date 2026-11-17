import { WALLET_ENDPOINT } from '@config/api.config';
import {
    GetWalletParams,
    WalletApiResponse,
    WalletData,
} from '@components/type/wallet.types';
import { normalizeWalletResponse } from '@lib/wallet/normalizeWallet';
import axiosClient from './axios';

export const getWallet = async ({
    userId,
    page = 1,
    limit = 1,
}: GetWalletParams): Promise<WalletData> => {
    const tenantId = process.env.NEXT_PUBLIC_TENANT_ID || '';

    const response = await axiosClient.get<WalletApiResponse>(WALLET_ENDPOINT, {
        params: {
            page,
            limit,
            tenantId,
            userId,
        },
    });

    return normalizeWalletResponse(response.data, page, limit);
};
