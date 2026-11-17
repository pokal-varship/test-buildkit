import {
    TransactionApiResponse,
    TransactionDetailVariant,
    TransactionHistoryItem,
    TransactionListData,
    TransactionStatusKind,
} from '@components/type/transaction.types';
import {
    getFormattedDate,
    getFormattedDateTime,
    getFormattedTime,
    toTimestampMs,
} from '@lib/helper/date';

const CURRENCY_CASH = 'INR';
const CURRENCY_POINTS = 'PTS';
const WALLET_TYPE_LOYALTY = 'LOYALTY_POINTS';

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

const normalizeCode = (value: unknown): string =>
    typeof value === 'string' ? value.toUpperCase().trim() : '';

const normalizeWalletType = normalizeCode;

const formatDateLabels = (value: unknown): { dateLabel: string; timeLabel: string } => {
    const timestampMs = toTimestampMs(value);
    if (timestampMs === null) {
        return { dateLabel: '', timeLabel: '' };
    }
    return {
        dateLabel: getFormattedDate(timestampMs),
        timeLabel: getFormattedTime(timestampMs),
    };
};

const POINTS_EXPIRY_LIST_FORMAT = 'MMM D, YYYY';

const formatPointsExpiryWebSuffix = (value: unknown): string | undefined => {
    const timestampMs = toTimestampMs(value);
    if (timestampMs === null) return undefined;
    return getFormattedDate(timestampMs, POINTS_EXPIRY_LIST_FORMAT);
};

const formatPointsExpiryMobileLabel = (value: unknown): string | undefined => {
    const timestampMs = toTimestampMs(value);
    if (timestampMs === null) return undefined;
    return getFormattedDate(timestampMs, POINTS_EXPIRY_LIST_FORMAT);
};

const formatExpirySubtitle = (value: unknown): string | undefined => {
    const timestampMs = toTimestampMs(value);
    if (timestampMs === null) return undefined;
    return getFormattedDate(timestampMs);
};

const resolvePointsExpiryMs = (row: Record<string, unknown>): unknown => {
    const nested = firstNestedItem(row);
    const metadata = asRecord(nested?.metadata ?? row.metadata);
    return metadata?.pointsExpiryMs ?? metadata?.pointsExpiryDateMs;
};

const resolveNestedCurrency = (row: Record<string, unknown>): string =>
    normalizeCode(firstNestedItem(row)?.currency ?? row.currency);

const resolveStatusKind = (row: Record<string, unknown>): TransactionStatusKind => {
    const txnType = normalizeCode(row.txnType);
    if (txnType === 'DEBIT') return 'debit';
    if (txnType === 'CREDIT') return 'credit';

    const direction = normalizeWalletType(
        row.direction ?? row.transactionDirection ?? row.flow ?? row.entryType
    );
    const type = normalizeWalletType(row.type ?? row.transactionType ?? row.operation);

    const debitHints = ['DEBIT', 'DR', 'DEBITED', 'REDEEM', 'REDEEMED', 'SPEND', 'WITHDRAW', 'DEDUCT'];
    const creditHints = ['CREDIT', 'CR', 'CREDITED', 'EARN', 'EARNED', 'TOPUP', 'TOP_UP', 'REFUND', 'ADD'];

    if (debitHints.some((hint) => direction.includes(hint) || type.includes(hint))) {
        return 'debit';
    }
    if (creditHints.some((hint) => direction.includes(hint) || type.includes(hint))) {
        return 'credit';
    }

    const amount = toNumber(row.amount ?? row.value ?? row.points ?? row.cashAmount);
    if (amount < 0) return 'debit';
    return 'credit';
};

const resolveCurrencyType = (row: Record<string, unknown>): 'cash' | 'points' => {
    const currency = resolveNestedCurrency(row);

    if (currency === CURRENCY_POINTS) return 'points';
    if (currency === CURRENCY_CASH) return 'cash';

    const walletType = normalizeWalletType(row.walletType ?? row.wallet_type);
    if (walletType === WALLET_TYPE_LOYALTY) return 'points';

    if (row.currencyType === 'points' || normalizeCode(row.type) === 'POINTS') {
        return 'points';
    }

    return 'cash';
};

const resolveTitle = (row: Record<string, unknown>): string => {
    const candidates = [
        row.title,
        row.description,
        row.transactionTitle,
        row.reason,
        row.category,
        row.type,
    ];
    for (const candidate of candidates) {
        if (typeof candidate === 'string' && candidate.trim()) {
            return candidate.trim();
        }
    }
    return 'Transaction';
};

const firstNestedItem = (row: Record<string, unknown>): Record<string, unknown> | null => {
    const items = row.items;
    if (!Array.isArray(items) || items.length === 0) return null;
    return asRecord(items[0]);
};

const formatOrderRef = (orderId: unknown): string | undefined => {
    const value =
        typeof orderId === 'string'
            ? orderId.trim()
            : typeof orderId === 'number' && !Number.isNaN(orderId)
              ? String(orderId)
              : '';

    if (!value) return undefined;
    return value.startsWith('#') ? value : `#${value}`;
};

const formatOrderSubtitle = (orderId: unknown): string | undefined => {
    const ref = formatOrderRef(orderId);
    if (!ref) return undefined;
    return `Order ${ref}`;
};

const resolveTxnCode = (row: Record<string, unknown>): string => {
    const nested = firstNestedItem(row);
    const raw = nested?.txnCode ?? row.txnCode;
    if (typeof raw === 'string' && raw.trim()) return raw.trim();
    if (typeof raw === 'number' && !Number.isNaN(raw)) return String(raw);
    return '';
};

const resolveOrderId = (row: Record<string, unknown>): string | undefined => {
    const nested = firstNestedItem(row);
    const raw =
        nested?.orderId ??
        row.orderId ??
        row.orderNumber ??
        row.orderReference ??
        row.referenceId ??
        row.order_id;

    if (typeof raw === 'string' && raw.trim()) return raw.trim();
    if (typeof raw === 'number' && !Number.isNaN(raw)) return String(raw);
    return undefined;
};

const resolveRechargeMode = (row: Record<string, unknown>): string | undefined => {
    const nested = firstNestedItem(row);
    const paymentTypeMode = nested?.paymentTypeMode ?? row.paymentTypeMode;
    if (typeof paymentTypeMode === 'string' && paymentTypeMode.trim()) {
        return paymentTypeMode.trim();
    }

    const paymentMethod =
        nested?.paymentMethod ??
        row.paymentMethod ??
        nested?.paymentMode ??
        row.paymentMode ??
        row.rechargeMode;

    if (typeof paymentMethod === 'string' && paymentMethod.trim()) {
        return paymentMethod.trim();
    }

    return undefined;
};

const resolvePointsExpiryDetail = (row: Record<string, unknown>): string | undefined => {
    if (resolveNestedCurrency(row) !== CURRENCY_POINTS) {
        return undefined;
    }

    const expiryMs = resolvePointsExpiryMs(row);
    if (expiryMs === undefined || expiryMs === null || expiryMs === '') {
        return undefined;
    }

    const timestampMs = toTimestampMs(expiryMs);
    if (timestampMs === null) return undefined;

    return getFormattedDateTime(timestampMs);
};

const resolveDetailVariant = (
    row: Record<string, unknown>,
    currencyType: 'cash' | 'points',
    statusKind: TransactionStatusKind
): TransactionDetailVariant => {
    const type = normalizeCode(
        row.type ?? row.category ?? row.transactionType ?? row.reason ?? row.title
    );

    if (currencyType === 'points') {
        return statusKind === 'credit' ? 'points_reward' : 'points_redeem';
    }

    if (statusKind === 'debit') {
        return 'cash_payment';
    }

    const topUpHints = ['TOPUP', 'TOP_UP', 'ADD_MONEY', 'RECHARGE', 'WALLET_TOPUP', 'DEPOSIT'];
    if (topUpHints.some((hint) => type.includes(hint))) {
        return 'cash_topup';
    }

    return 'generic';
};

const resolveRewardType = (row: Record<string, unknown>): string | undefined => {
    const nested = firstNestedItem(row);
    const candidates = [
        nested?.rewardType,
        row.rewardType,
        nested?.category,
        row.category,
        nested?.type,
        row.type,
    ];

    for (const candidate of candidates) {
        if (typeof candidate === 'string' && candidate.trim()) {
            return candidate.trim();
        }
    }

    return resolveTitle(row);
};

const resolveOrderSubtitle = (row: Record<string, unknown>): string | undefined => {
    const nested = firstNestedItem(row);
    return formatOrderSubtitle(
        nested?.orderId ??
            row.orderId ??
            row.orderNumber ??
            row.orderReference ??
            row.referenceId ??
            row.order_id
    );
};

/** Mobile left subtitle: trigger only (expiry shown on the right via pointsExpiryLabel). */
const resolveSubtitle = (row: Record<string, unknown>): string | undefined => {
    const items = row.items;
    const trigger =
        (Array.isArray(items) ? asRecord(items[0])?.trigger : undefined) ?? row.trigger;
    if (typeof trigger === 'string' && trigger.trim()) {
        return trigger.trim();
    }
    return undefined;
};

/** Shown below amount on mobile for PTS rows (metadata.pointsExpiryMs). */
const resolvePointsExpiryLabel = (row: Record<string, unknown>): string | undefined => {
    if (resolveNestedCurrency(row) !== CURRENCY_POINTS) return undefined;
    return formatPointsExpiryMobileLabel(resolvePointsExpiryMs(row));
};

/** Desktop table subtitle: trigger only (expiry appended in UI). */
const resolveWebSubtitle = (row: Record<string, unknown>): string | undefined => {
    return resolveSubtitle(row);
};

const resolveStatusLabel = (
    statusKind: TransactionStatusKind,
    currencyType: 'cash' | 'points',
    row: Record<string, unknown>
): string => {
    const raw = row.statusLabel ?? row.status ?? row.transactionStatus;
    if (typeof raw === 'string' && raw.trim()) {
        return raw.trim();
    }

    if (currencyType === 'points') {
        return statusKind === 'debit' ? 'Redeemed' : 'Earned';
    }
    return statusKind === 'debit' ? 'Debited' : 'Credited';
};

const extractTransactionList = (root: Record<string, unknown>): unknown[] => {
    const data = asRecord(root.data) ?? root;
    return (
        (Array.isArray(data.items) && data.items) ||
        (Array.isArray(data.transactions) && data.transactions) ||
        (Array.isArray(data.transactionHistory) && data.transactionHistory) ||
        (Array.isArray(data.list) && data.list) ||
        (Array.isArray(root.transactions) && root.transactions) ||
        []
    );
};

const mapTransactionRow = (item: unknown, index: number): TransactionHistoryItem | null => {
    const row = asRecord(item);
    if (!row) return null;

    const timestamp =
        row.createdAt ??
        row.created_at ??
        row.transactionDate ??
        row.date ??
        row.timestamp;

    const { dateLabel, timeLabel } = formatDateLabels(timestamp);
    const currencyType = resolveCurrencyType(row);
    const statusKind = resolveStatusKind(row);
    const amount = Math.abs(
        toNumber(row.amount ?? row.value ?? row.points ?? row.cashAmount)
    );

    const transactionId = String(
        row.transactionId ??
            row.transaction_id ??
            row.txnId ??
            row.referenceNumber ??
            row.id ??
            row._id ??
            index
    );

    const orderId = resolveOrderId(row);
    const orderNumber = formatOrderRef(orderId);
    const rechargeMode = resolveRechargeMode(row);
    const detailVariant = resolveDetailVariant(row, currencyType, statusKind);

    return {
        id: String(row.id ?? row._id ?? transactionId),
        transactionId,
        txnCode: resolveTxnCode(row),
        dateLabel,
        timeLabel,
        title: resolveTitle(row),
        subtitle: resolveSubtitle(row),
        webSubtitle: resolveWebSubtitle(row),
        pointsExpiryLabel: resolvePointsExpiryLabel(row),
        pointsExpiryDetail: resolvePointsExpiryDetail(row),
        amount,
        currencyType,
        statusKind,
        statusLabel: resolveStatusLabel(statusKind, currencyType, row),
        detailVariant,
        orderId,
        orderNumber,
        rechargeMode: rechargeMode ?? (detailVariant === 'cash_topup' ? resolveSubtitle(row) : undefined),
        rewardType: currencyType === 'points' && statusKind === 'credit' ? resolveRewardType(row) : undefined,
        earnedFrom: currencyType === 'points' && statusKind === 'credit' ? orderNumber : undefined,
    };
};

export const normalizeTransactionResponse = (
    response: TransactionApiResponse,
    page = 1,
    limit = 12
): TransactionListData => {
    const root = response as Record<string, unknown>;
    const data = asRecord(root.data) ?? root;
    const pagination = asRecord(data.pagination) ?? asRecord(root.pagination);

    const transactions = extractTransactionList(root)
        .map(mapTransactionRow)
        .filter((item): item is TransactionHistoryItem => item !== null);

    const totalCount =
        toNumber(pagination?.total) ||
        toNumber(pagination?.totalCount) ||
        toNumber(root.totalCount) ||
        toNumber(data.totalCount) ||
        transactions.length;

    return {
        transactions,
        totalCount,
        page: toNumber(pagination?.page) || toNumber(root.page) || page,
        limit: toNumber(pagination?.limit) || toNumber(root.limit) || limit,
    };
};
