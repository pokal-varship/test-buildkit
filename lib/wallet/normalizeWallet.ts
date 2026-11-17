import {
    ApiWalletItem,
    WalletApiResponse,
    WalletData,
    WalletSummary,
    WalletTransaction,
    WalletType,
} from '@components/type/wallet.types';
import { getFormattedDate, toTimestampMs } from '@lib/helper/date';

const WALLET_TYPE_CASH: WalletType = 'CASH';
const WALLET_TYPE_LOYALTY: WalletType = 'LOYALTY_POINTS';

const toNumber = (value: unknown): number => {
    if (typeof value === 'number' && !Number.isNaN(value)) {
        return value;
    }
    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number.parseFloat(value);
        return Number.isNaN(parsed) ? 0 : parsed;
    }
    return 0;
};

const asRecord = (value: unknown): Record<string, unknown> | null => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return value as Record<string, unknown>;
    }
    return null;
};

const formatExpiringDate = (value: unknown): string | undefined => {
    if (value === undefined || value === null || value === '') return undefined;

    const timestampMs = toTimestampMs(value);
    if (timestampMs !== null) {
        return getFormattedDate(timestampMs);
    }

    if (typeof value === 'string' || typeof value === 'number') {
        return String(value);
    }

    return undefined;
};

const normalizeWalletType = (value: unknown): string =>
    typeof value === 'string' ? value.toUpperCase().trim() : '';

const findWalletByType = (
    wallets: ApiWalletItem[] | undefined,
    walletType: WalletType
): ApiWalletItem | undefined =>
    wallets?.find((wallet) => normalizeWalletType(wallet.walletType) === walletType);

const extractSummaryFromWallets = (wallets: ApiWalletItem[] | undefined): WalletSummary => {
    const cashWallet = findWalletByType(wallets, WALLET_TYPE_CASH);
    const loyaltyWallet = findWalletByType(wallets, WALLET_TYPE_LOYALTY);
    const pointsTotals = loyaltyWallet?.pointsTotals;

    const cashBalance = toNumber(cashWallet?.balance);
    const loyaltyPoints =
        toNumber(pointsTotals?.pointsBalance) || toNumber(loyaltyWallet?.balance);

    const loyaltyCashEquivalent = toNumber(
        pointsTotals?.cashEquivalent ?? pointsTotals?.equivalentAmount
    );

    const lifetimeEarnedPoints = toNumber(
        pointsTotals?.totalPointsEarned ??
            pointsTotals?.lifetimeEarned ??
            pointsTotals?.lifetimeEarnedPoints
    );

    const expiringPoints = toNumber(
        pointsTotals?.nextExpiringPoints ?? pointsTotals?.expiringPoints
    );
    const expiringDate =
        formatExpiringDate(pointsTotals?.nextExpiringDate) ??
        formatExpiringDate(pointsTotals?.expiringDate) ??
        formatExpiringDate(pointsTotals?.expiresAt);

    return {
        cashBalance,
        loyaltyPoints,
        loyaltyCashEquivalent,
        lifetimeEarnedPoints,
        expiringPoints: expiringPoints > 0 ? expiringPoints : undefined,
        expiringDate,
        cashWalletId: cashWallet?.id,
        loyaltyWalletId: loyaltyWallet?.id,
    };
};

const extractSummary = (root: Record<string, unknown>): WalletSummary => {
    const data = asRecord(root.data) ?? root;
    const wallets = Array.isArray(data.wallets)
        ? (data.wallets as ApiWalletItem[])
        : undefined;

    if (wallets?.length) {
        return extractSummaryFromWallets(wallets);
    }

    return {
        cashBalance: 0,
        loyaltyPoints: 0,
        loyaltyCashEquivalent: 0,
        lifetimeEarnedPoints: 0,
    };
};

const extractTransactions = (root: Record<string, unknown>): WalletTransaction[] => {
    const data = asRecord(root.data) ?? root;
    const list =
        (Array.isArray(data.transactions) && data.transactions) ||
        (Array.isArray(data.transactionHistory) && data.transactionHistory) ||
        (Array.isArray(root.transactions) && root.transactions) ||
        [];

    const transactions: WalletTransaction[] = [];

    list.forEach((item, index) => {
        const row = asRecord(item);
        if (!row) return;

        const amount = toNumber(row.amount ?? row.value ?? row.points ?? row.cashAmount);
        const id = String(row.id ?? row.transactionId ?? row._id ?? index);
        const walletType = normalizeWalletType(row.walletType);

        transactions.push({
            id,
            transactionId: row.transactionId ? String(row.transactionId) : undefined,
            date: String(row.date ?? row.createdAt ?? row.transactionDate ?? ''),
            description: String(row.description ?? row.title ?? row.type ?? ''),
            amount,
            currencyType:
                walletType === WALLET_TYPE_LOYALTY ||
                row.currencyType === 'points' ||
                row.type === 'points'
                    ? 'points'
                    : 'cash',
            transactionType: row.transactionType
                ? String(row.transactionType)
                : row.type
                  ? String(row.type)
                  : undefined,
        });
    });

    return transactions;
};

export const normalizeWalletResponse = (
    response: WalletApiResponse,
    page = 1,
    limit = 1
): WalletData => {
    const root = response as Record<string, unknown>;
    const data = asRecord(root.data) ?? root;
    const pagination = asRecord(data.pagination) ?? asRecord(root.pagination);

    const totalCount =
        toNumber(pagination?.total) ||
        toNumber(pagination?.totalCount) ||
        toNumber(root.totalCount) ||
        toNumber(data.totalCount) ||
        extractTransactions(root).length;

    return {
        summary: extractSummary(root),
        transactions: extractTransactions(root),
        totalCount,
        page: toNumber(pagination?.page) || toNumber(root.page) || page,
        limit: toNumber(pagination?.limit) || toNumber(root.limit) || limit,
    };
};

export const selectWalletSummary = (walletData: WalletData | null): WalletSummary | null =>
    walletData?.summary ?? null;
