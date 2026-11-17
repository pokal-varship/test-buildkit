import {
    GetTransactionsParams,
    TransactionApiResponse,
    TransactionFilter,
    TransactionListData,
} from '@components/type/transaction.types';
import { TRANSACTION_ENDPOINT } from '@config/api.config';
import { normalizeTransactionResponse } from '@lib/wallet/normalizeTransaction';
import axiosClient from './axios';

const filterToCurrency = (filter: TransactionFilter): string | undefined => {
    if (filter === 'cash') return 'INR';
    if (filter === 'points') return 'PTS';
    return undefined;
};

export const getTransactions = async ({
    userId,
    page = 1,
    limit = 12,
    filter = 'all',
}: GetTransactionsParams & { filter?: TransactionFilter }): Promise<TransactionListData> => {
    const tenantId = process.env.NEXT_PUBLIC_TENANT_ID || '';
    const currency = filterToCurrency(filter);

    const response = await axiosClient.get<TransactionApiResponse>(TRANSACTION_ENDPOINT, {
        params: {
            page,
            limit,
            tenantId,
            userId,
            ...(currency && { currency }),
        },
    });

    const normalized = normalizeTransactionResponse(response.data, page, limit);

    if (filter === 'all') {
        return normalized;
    }

    const filteredTransactions = normalized.transactions.filter((txn) =>
        filter === 'cash' ? txn.currencyType === 'cash' : txn.currencyType === 'points'
    );

    return {
        ...normalized,
        transactions: filteredTransactions,
        totalCount: currency ? normalized.totalCount : filteredTransactions.length,
    };
};
