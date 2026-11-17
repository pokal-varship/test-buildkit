export type WalletType = 'CASH' | 'LOYALTY_POINTS';

export interface WalletPointsTotals {
    pointsBalance?: number;
    lifetimeEarned?: number;
    lifetimeEarnedPoints?: number;
    totalPointsEarned?: number;
    cashEquivalent?: number;
    equivalentAmount?: number;
    expiringPoints?: number;
    expiringDate?: string | number;
    expiresAt?: string | number;
    nextExpiringPoints?: number;
    nextExpiringDate?: string | number;
}

export interface ApiWalletItem {
    id: string;
    walletType: WalletType | string;
    balance: number;
    currency?: string;
    currencySymbol?: string;
    status?: string;
    lastTransactionAt?: number;
    pointsTotals?: WalletPointsTotals;
}

export interface WalletStats {
    thisMonthCredits?: number;
    thisMonthDebits?: number;
    thisMonthPointsEarned?: number;
    thisMonthPointsRedeemed?: number;
}

export interface WalletApiData {
    wallets?: ApiWalletItem[];
    stats?: WalletStats;
    transactions?: unknown[];
    transactionHistory?: unknown[];
    pagination?: Record<string, unknown>;
    totalCount?: number;
}

export interface WalletSummary {
    cashBalance: number;
    loyaltyPoints: number;
    loyaltyCashEquivalent: number;
    lifetimeEarnedPoints: number;
    expiringPoints?: number;
    expiringDate?: string;
    cashWalletId?: string;
    loyaltyWalletId?: string;
}

export interface WalletTransaction {
    id: string;
    transactionId?: string;
    date: string;
    description: string;
    amount: number;
    currencyType?: 'cash' | 'points';
    transactionType?: string;
}

export interface WalletData {
    summary: WalletSummary;
    transactions: WalletTransaction[];
    totalCount: number;
    page: number;
    limit: number;
}

export interface WalletApiResponse {
    status?: string;
    message?: string;
    data?: WalletApiData;
    totalCount?: number;
    page?: number;
    limit?: number;
}

export interface GetWalletParams {
    userId: string;
    page?: number;
    limit?: number;
}
