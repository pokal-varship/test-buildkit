'use client';

import CustomButton from '@components/buttons/Button';
import Icon from '@components/image/Icons';
import { TransactionHistoryItem } from '@components/type/transaction.types';
import {
    COIN_ICON,
    CROSS_ICON,
    WALLET_DETAIL_CREDIT_ICON,
    WALLET_DETAIL_DEBIT_ICON,
} from '@config/Header/image.config';
import useLang from '@hooks/useLang';
import formatCurrency from '@lib/helper/price';
import { cn } from '@lib/utils';
import { useRouter } from 'next/navigation';
import { LanguageCode, TranslationKeys } from 'types';

interface WalletTransactionDetailModalProps {
    transaction: TransactionHistoryItem;
    onClose: () => void;
}

interface DetailRow {
    key: string;
    label: string;
    value: React.ReactNode;
    valueClassName?: string;
}

const formatModalAmount = (txn: TransactionHistoryItem) => {
    if (txn.currencyType === 'points') {
        return txn.amount.toLocaleString();
    }
    const formatted = formatCurrency({ amount: txn.amount }).trim();
    return txn.statusKind === 'debit' ? `-${formatted}` : formatted;
};

const WalletTransactionDetailModal: React.FC<WalletTransactionDetailModalProps> = ({
    transaction: txn,
    onClose,
}) => {
    const [lang]: [TranslationKeys, LanguageCode] = useLang();
    const router = useRouter();

    const dateTimeValue = [txn.dateLabel, txn.timeLabel].filter(Boolean).join(' ');

    const headerMessage = (() => {
        switch (txn.detailVariant) {
            case 'cash_topup':
                return lang.walletPage.detailAmountAddedSuccess;
            case 'points_reward':
                return lang.walletPage.detailPurchaseRewardEarned;
            case 'cash_payment':
                return lang.walletPage.detailPaymentProcessed;
            case 'points_redeem':
                return lang.walletPage.detailPointsRedeemed;
            default:
                return txn.statusKind === 'credit'
                    ? txn.currencyType === 'points'
                        ? lang.walletPage.detailPurchaseRewardEarned
                        : lang.walletPage.detailAmountCredited
                    : lang.walletPage.detailPaymentProcessed;
        }
    })();

    const rows: DetailRow[] = [
        {
            key: 'transactionId',
            label: lang.walletPage.detailTransactionId,
            value: txn.transactionId,
        },
    ];

    if (txn.detailVariant === 'points_reward') {
        if (txn.rewardType) {
            rows.push({
                key: 'rewardType',
                label: lang.walletPage.detailRewardType,
                value: txn.rewardType,
            });
        }
        if (txn.earnedFrom) {
            rows.push({
                key: 'earnedFrom',
                label: lang.walletPage.detailEarnedFrom,
                value: txn.earnedFrom,
            });
        }
        if (txn.pointsExpiryDetail) {
            rows.push({
                key: 'expires',
                label: lang.walletPage.detailExpires,
                value: txn.pointsExpiryDetail,
                valueClassName: 'text-[var(--error)]',
            });
        }
    } else if (txn.detailVariant === 'cash_payment') {
        if (txn.orderNumber) {
            rows.push({
                key: 'orderNumber',
                label: lang.walletPage.detailOrderNumber,
                value: (
                    <span className="flex w-full items-center justify-between gap-3">
                        <span>{txn.orderNumber}</span>
                        {txn.orderId ? (
                            <button
                                type="button"
                                className="extra-small-font md-heading-6 shrink-0 cursor-pointer border-0 bg-transparent p-0 font-500 text-[var(--accent-color)] underline"
                                onClick={() => {
                                    onClose();
                                    router.push(`/orders/${txn.orderId}`);
                                }}
                            >
                                {lang.walletPage.detailViewOrder}
                            </button>
                        ) : null}
                    </span>
                ),
            });
        }
        const rechargeMode = txn.rechargeMode ?? txn.subtitle;
        if (rechargeMode) {
            rows.push({
                key: 'rechargeMode',
                label: lang.walletPage.detailRechargeMode,
                value: rechargeMode,
            });
        }
    } else if (txn.detailVariant === 'cash_topup') {
        const rechargeMode = txn.rechargeMode ?? txn.subtitle;
        if (rechargeMode) {
            rows.push({
                key: 'rechargeMode',
                label: lang.walletPage.detailRechargeMode,
                value: rechargeMode,
            });
        }
    } else {
        if (txn.orderNumber) {
            rows.push({
                key: 'orderNumber',
                label: lang.walletPage.detailOrderNumber,
                value: txn.orderNumber,
            });
        }
        const rechargeMode = txn.rechargeMode ?? txn.subtitle;
        if (rechargeMode && txn.currencyType === 'cash') {
            rows.push({
                key: 'rechargeMode',
                label: lang.walletPage.detailRechargeMode,
                value: rechargeMode,
            });
        }
    }

    if (dateTimeValue) {
        rows.push({
            key: 'dateTime',
            label: lang.walletPage.detailDateTime,
            value: dateTimeValue,
        });
    }

    return (
        <div className="flex h-full min-h-0 w-full min-w-0 flex-col bg-[var(--primary-background)] px-4 pb-8 pt-4">
            <div className="flex shrink-0 justify-end">
                <button
                    type="button"
                    className="flex cursor-pointer items-center justify-center border-0 bg-transparent p-1"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <Icon
                        icon={`${CROSS_ICON}#cross`}
                        width={16}
                        height={16}
                        color="var(--primary-text)"
                        className="cursor-pointer"
                        viewBox="0 0 16 16"
                    />
                </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col justify-between gap-8 pt-4">
                <div className="flex flex-col gap-8">
                    <div className="rounded-2xl bg-[var(--transaction-history-bg)] px-4 py-6 text-center">
                        <div className="mb-3 flex h-[60px] justify-center">
                            <img
                                src={
                                    txn.statusKind === 'credit'
                                        ? WALLET_DETAIL_CREDIT_ICON
                                        : WALLET_DETAIL_DEBIT_ICON
                                }
                                alt=""
                                width={60}
                                height={60}
                                className="h-[60px] w-[60px]"
                            />
                        </div>
                        <div className="flex items-center justify-center gap-1">
                            {txn.currencyType === 'points' ? (
                                <img
                                    src={COIN_ICON}
                                    alt=""
                                    width={38}
                                    height={40}
                                    className="h-10 w-9 shrink-0"
                                />
                            ) : null}
                            <span className="heading-1 font-700 text-[var(--primary-text)]">
                                {formatModalAmount(txn)}
                            </span>
                        </div>
                        <p className="extra-small-font md-heading-6 m-0 font-400 text-[var(--secondary-text)]">
                            {headerMessage}
                        </p>
                    </div>

                    <div className="flex flex-col gap-5">
                        {rows.map((row) => (
                            <div key={row.key}>
                                <p
                                    className={cn(
                                        'heading-6 font-500 m-0 mb-0.5 break-all text-[var(--primary-text)]',
                                        row.valueClassName
                                    )}
                                >
                                    {row.value}
                                </p>
                                <p className="extra-small-font md-heading-6 m-0 font-400 text-[var(--secondary-text)]">
                                    {row.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <CustomButton
                    className="heading-4 min-h-12 shrink-0 !w-full rounded-[10px] font-700 text-[var(--button-primary-text)] hover:text-[var(--button-primary-hover-text)]"
                    onClick={onClose}
                >
                    {lang.walletPage.done}
                </CustomButton>
            </div>
        </div>
    );
};

export default WalletTransactionDetailModal;
