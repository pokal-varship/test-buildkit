export type TransactionFilter = 'all' | 'cash' | 'points';

export type TransactionStatusKind = 'credit' | 'debit';

export type TransactionDetailVariant =
    | 'cash_topup'
    | 'points_reward'
    | 'cash_payment'
    | 'points_redeem'
    | 'generic';

export interface TransactionHistoryItem {
    id: string;
    transactionId: string;
    txnCode: string;
    dateLabel: string;
    timeLabel: string;
    title: string;
    /** Mobile left-column subtitle (order ref / payment mode) */
    subtitle?: string;
    /** Desktop table subtitle (e.g. "Order #ORD-2451 · Exp Jul 3, 2026") */
    webSubtitle?: string;
    /** Mobile: expiry below amount (e.g. "Exp: Jul 3, 2026") */
    pointsExpiryLabel?: string;
    /** Full expiry line for transaction detail modal (metadata.pointsExpiryMs) */
    pointsExpiryDetail?: string;
    amount: number;
    currencyType: 'cash' | 'points';
    statusKind: TransactionStatusKind;
    statusLabel: string;
    detailVariant?: TransactionDetailVariant;
    orderId?: string;
    orderNumber?: string;
    rechargeMode?: string;
    rewardType?: string;
    earnedFrom?: string;
}

export interface TransactionListData {
    transactions: TransactionHistoryItem[];
    totalCount: number;
    page: number;
    limit: number;
}

export interface TransactionApiResponse {
    status?: string;
    message?: string;
    data?: unknown;
    totalCount?: number;
    page?: number;
    limit?: number;
}

export interface GetTransactionsParams {
    userId: string;
    page?: number;
    limit?: number;
    walletType?: string;
}
