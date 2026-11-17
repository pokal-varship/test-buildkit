'use client';

import CustomButton from '@components/buttons/Button';
import CustomDialog from '@components/dialogDrawer/dialog';
import Icon from '@components/image/Icons';
import Loader from '@components/loader/Loader';
import NoDataPlaceholder from '@components/no-data-placeholder/no-data-placeholder';
import { TransactionFilter, TransactionHistoryItem } from '@components/type/transaction.types';
import {
    ARROW_LEFT_ICON,
    ARROW_RIGHT_ICON,
    COIN_ICON,
    NO_TRANSACTION_PLACEHOLDER,
    WALLET_CREDIT_ICON,
    WALLET_DEBIT_ICON,
} from '@config/Header/image.config';
import useAuth from '@hooks/useAuth';
import useIsMobile from '@hooks/useIsMobile';
import useLang from '@hooks/useLang';
import useWalletTransactions from '@hooks/useWalletTransactions';
import formatCurrency from '@lib/helper/price';
import { walletRechargeSuccessSubject } from '@lib/rxSubject';
import { cn } from '@lib/utils';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const FILTER_OPTIONS: TransactionFilter[] = ['all', 'cash', 'points'];
const MOBILE_RECENT_LIMIT = 5;
const DESKTOP_LIMIT = 12;
/** Load next page when remaining scroll is within this fraction of viewport height. */
const MOBILE_PREFETCH_VIEWPORT_RATIO = 0.9;

const getPageItems = (currentPage: number, totalPages: number): (number | 'ellipsis')[] => {
    if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const items: (number | 'ellipsis')[] = [1];

    if (currentPage > 3) {
        items.push('ellipsis');
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let page = start; page <= end; page += 1) {
        items.push(page);
    }

    if (currentPage < totalPages - 2) {
        items.push('ellipsis');
    }

    if (!items.includes(totalPages)) {
        items.push(totalPages);
    }

    return items;
};

const formatDisplayAmount = (txn: TransactionHistoryItem) => {
    if (txn.currencyType === 'points') {
        return txn.amount.toLocaleString();
    }
    const formatted = formatCurrency({ amount: txn.amount }).trim();
    return txn.statusKind === 'debit' ? `-${formatted}` : formatted;
};

interface MobileTransactionRowProps {
    txn: TransactionHistoryItem;
    showChevron?: boolean;
    onClick?: () => void;
}

const MobileTransactionRow: React.FC<MobileTransactionRowProps> = ({
    txn,
    showChevron = true,
    onClick,
}) => {
    const [lang] = useLang();
    const dateTimeLabel = [txn.dateLabel, txn.timeLabel].filter(Boolean).join(' ');

    const rowClassName = cn(
        'flex gap-3 border-b border-[var(--rating-border-primary)] py-4 last:border-b-0',
        onClick && 'cursor-pointer'
    );

    const content = (
        <>
            <div className="min-w-0 flex-1">
                <div className="mb-2.5 flex flex-col flex-wrap items-baseline">
                    <span className="extra-small-font md-heading-6 font-400 text-[var(--primary-text)]">
                        {txn.txnCode || txn.transactionId}
                    </span>
                    {dateTimeLabel ? (
                        <span className="extra-small-font md-heading-6 font-400 text-[var(--secondary-text)]">
                            {dateTimeLabel}
                        </span>
                    ) : null}
                </div>
                <p className="heading-6 font-400 m-0 mb-0.5 text-[var(--primary-text)] capitalize">
                    {txn.title}
                </p>
                {txn.subtitle ? (
                    <p className="extra-small-font md-heading-6 font-400 m-0 text-[var(--secondary-text)]">
                        {txn.subtitle}
                    </p>
                ) : null}
            </div>
            <div className="flex shrink-0 items-end gap-2">
                <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1">
                        <img
                            src={
                                txn.statusKind === 'credit'
                                    ? WALLET_CREDIT_ICON
                                    : WALLET_DEBIT_ICON
                            }
                            alt=""
                            width={16}
                            height={16}
                            className="h-4 w-4 shrink-0"
                        />
                        <div className="flex items-center gap-0.5">
                            {txn.currencyType === 'points' ? (
                                <img
                                    src={COIN_ICON}
                                    alt=""
                                    width={16}
                                    height={16}
                                    className="shrink-0"
                                />
                            ) : null}
                            <span
                                className={cn(
                                    'heading-6 font-600 whitespace-nowrap text-[var(--primary-text)]'
                                )}
                            >
                                {formatDisplayAmount(txn)}
                            </span>
                        </div>
                        {showChevron ? (
                    <Icon
                        icon={`${ARROW_RIGHT_ICON}#arrow-right`}
                        width={16}
                        height={16}
                        color="var(--secondary-text)"
                        className="mt-1 shrink-0"
                        viewBox="0 0 24 24"
                    />
                ) : null}
                    </div>
                    {txn.pointsExpiryLabel ? (
                        <p className="extra-small-font font-400 m-0 whitespace-nowrap text-[var(--secondary-text)]">
                            {lang.walletPage.expiryWithColon} {txn.pointsExpiryLabel}
                        </p>
                    ) : null}
                </div>
            </div>
        </>
    );

    if (!onClick) {
        return <div className={rowClassName}>{content}</div>;
    }

    return (
        <button type="button" onClick={onClick} className={cn(rowClassName, 'w-full bg-transparent text-left')}>
            {content}
        </button>
    );
};

interface FilterTabsProps {
    filter: TransactionFilter;
    filterLabels: Record<TransactionFilter, string>;
    onFilterChange: (filter: TransactionFilter) => void;
    ariaLabel: string;
    isMobileSurface?: boolean;
}

const FilterTabs: React.FC<FilterTabsProps> = ({
    filter,
    filterLabels,
    onFilterChange,
    ariaLabel,
    isMobileSurface = false,
}) => (
    <div
        className={cn(
            'flex flex-wrap gap-2  border p-1',
            isMobileSurface
                ? 'p-4'
                : 'rounded-xl border p-1 border-[var(--transaction-history-bg)]'
        )}
        role="tablist"
        aria-label={ariaLabel}
    >
        {FILTER_OPTIONS.map((option) => {
            const isActive = filter === option;
            return (
                <CustomButton
                    key={option}
                    type="button"
                    onClick={() => onFilterChange(option)}
                    className={cn(
                        'heading-6 font-500 !rounded-[10px] !md:px-3.5 !px-3 !md:py-2 transition-colors',
                        !isActive &&
                            '!border-[var(--rating-border-primary)] !text-[var(--secondary-text)]'
                    )}
                    styles={
                        isActive
                            ? isMobileSurface
                              ? {
                                    backgroundColor:
                                        'var(--button-primary-active-background)',
                                    border: '1px solid var(--rating-border-primary)',
                                    color: 'var(--primary-text)',
                                }
                              : {
                                    backgroundColor: 'var(--button-primary-background)',
                                    border: 'var(--button-primary-border-width) solid var(--button-primary-border-color)',
                                    color: 'var(--button-primary-text)',
                                }
                            : isMobileSurface
                              ? {
                                    backgroundColor: 'transparent',
                                    border: '1px solid var(--rating-border-primary)',
                                    color: 'var(--secondary-text)',
                                    hoverColor: 'var(--primary-background)',
                                }
                              : {
                                    backgroundColor: 'var(--tertiary-background)',
                                    border: 'none',
                                    color: 'var(--secondary-text)',
                                    hoverColor: 'var(--white)',
                                }
                    }
                >
                    {filterLabels[option]}
                </CustomButton>
            );
        })}
    </div>
);

interface WalletTransactionsEmptyStateProps {
    className?: string;
}

const WalletTransactionsEmptyState: React.FC<WalletTransactionsEmptyStateProps> = ({
    className,
}) => {
    const [lang] = useLang();

    return (
        <NoDataPlaceholder
            imageSrc={NO_TRANSACTION_PLACEHOLDER}
            imageAlt=""
            imageWidth={144}
            imageHeight={144}
            title={lang.walletPage.noTransactionsYet}
            subtitle={lang.walletPage.noTransactionsSubtitle}
            className={cn(
                'flex w-full min-h-[240px] flex-1 flex-col items-center justify-center !rounded-none !bg-transparent !px-6 !py-12 md:min-h-0 md:h-full md:!py-0 [&_.noDataPlaceholder__subtitle]:!mb-0',
                className
            )}
            regionLabel="No transactions placeholder"
        />
    );
};

const WalletTransactionHistory: React.FC = () => {
    const [lang] = useLang();
    const { userId } = useAuth();
    const isMobile = useIsMobile();
    const [showMobileFullHistory, setShowMobileFullHistory] = useState(false);
    const [selectedTransaction, setSelectedTransaction] =
        useState<TransactionHistoryItem | null>(null);

    const isDesktopViewport =
        typeof window !== 'undefined' &&
        window.matchMedia('(min-width: 768px)').matches;

    const transactionLimit =
        isDesktopViewport || showMobileFullHistory
            ? DESKTOP_LIMIT
            : MOBILE_RECENT_LIMIT;
    const mobileInfiniteScroll = isMobile && showMobileFullHistory;

    const {
        filter,
        page,
        transactions,
        totalCount,
        totalPages,
        rangeStart,
        rangeEnd,
        hasMore,
        loading,
        loadingMore,
        error,
        handleFilterChange,
        handlePageChange,
        refetchTransactions,
    } = useWalletTransactions({
        userId,
        limit: transactionLimit,
        accumulatePages: mobileInfiniteScroll,
    });

    useEffect(() => {
        const subscription = walletRechargeSuccessSubject.subscribe(() => {
            refetchTransactions({ fromStart: true }).catch(() => undefined);
        });
        return () => subscription.unsubscribe();
    }, [refetchTransactions]);

    const mobileScrollRef = useRef<HTMLDivElement>(null);
    const pageRef = useRef(page);
    const hasMoreRef = useRef(hasMore);
    const loadingRef = useRef(loading);
    const loadingMoreRef = useRef(loadingMore);

    pageRef.current = page;
    hasMoreRef.current = hasMore;
    loadingRef.current = loading;
    loadingMoreRef.current = loadingMore;

    const filterLabels: Record<TransactionFilter, string> = {
        all: lang.walletPage.filterAll,
        cash: lang.walletPage.filterCashOnly,
        points: lang.walletPage.filterPointsOnly,
    };

    const pageItems = useMemo(() => getPageItems(page, totalPages), [page, totalPages]);

    const getStatusLabel = (txn: TransactionHistoryItem) => {
        if (txn.currencyType === 'points') {
            return txn.statusKind === 'debit'
                ? lang.walletPage.statusRedeemed
                : lang.walletPage.statusEarned;
        }
        return txn.statusKind === 'debit'
            ? lang.walletPage.statusDebited
            : lang.walletPage.statusCredited;
    };

    const formatAmount = (txn: TransactionHistoryItem) => {
        if (txn.currencyType === 'points') {
            return txn.amount.toLocaleString();
        }
        return formatCurrency({ amount: txn.amount }).trim();
    };

    const showingText =
        totalCount === 0
            ? lang.walletPage.showingNone
            : lang.walletPage.showingRange
                  .replace('{start}', String(rangeStart))
                  .replace('{end}', String(rangeEnd))
                  .replace('{total}', String(totalCount));

    const isHistoryEmpty = transactions.length === 0;

    const paginationBtnClass = 'heading-6 font-500 !min-h-8 !min-w-8 !rounded-lg !px-2 !py-0 transition-colors';

    const getPaginationButtonStyles = (isActive: boolean) =>
        isActive
            ? {
                  backgroundColor: 'var(--primary-color)',
                  border: '1px solid var(--primary-color)',
                  color: 'var(--white)',
                  hoverColor: 'var(--primary-color)',
                  height: '30px',
                  width: '30px',
              }
            : {
                  backgroundColor: 'var(--tertiary-background)',
                  border: '1px solid var(--transaction-history-bg)',
                  color: 'var(--primary-text)',
                  hoverColor: 'var(--white)',
                  height: '30px',
                  width: '30px',
              };

    const showViewAll = totalCount > MOBILE_RECENT_LIMIT;

    const handleOpenMobileFullHistory = useCallback(() => {
        setShowMobileFullHistory(true);
    }, []);

    const handleCloseMobileFullHistory = useCallback(() => {
        setShowMobileFullHistory(false);
        if (filter !== 'all' || page !== 1) {
            handleFilterChange('all');
        }
    }, [filter, page, handleFilterChange]);

    useEffect(() => {
        if (!showMobileFullHistory) return undefined;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [showMobileFullHistory]);

    const tryLoadMore = useCallback(() => {
        if (!hasMoreRef.current || loadingRef.current || loadingMoreRef.current) return;
        handlePageChange(pageRef.current + 1);
    }, [handlePageChange]);

    const checkPrefetch = useCallback(() => {
        const scrollEl = mobileScrollRef.current;
        if (!scrollEl) return;

        const remaining = scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight;
        const threshold = Math.max(
            scrollEl.clientHeight * MOBILE_PREFETCH_VIEWPORT_RATIO,
            400
        );

        if (remaining <= threshold) {
            tryLoadMore();
        }
    }, [tryLoadMore]);

    useEffect(() => {
        if (!mobileInfiniteScroll) return undefined;

        let scrollEl: HTMLDivElement | null = null;
        const onScroll = () => checkPrefetch();

        const attach = () => {
            scrollEl = mobileScrollRef.current;
            if (!scrollEl) return;
            scrollEl.addEventListener('scroll', onScroll, { passive: true });
            checkPrefetch();
        };

        const frame = requestAnimationFrame(attach);

        return () => {
            cancelAnimationFrame(frame);
            scrollEl?.removeEventListener('scroll', onScroll);
        };
    }, [mobileInfiniteScroll, checkPrefetch]);

    useEffect(() => {
        if (!mobileInfiniteScroll || loading || loadingMore) return undefined;

        const frame = requestAnimationFrame(() => checkPrefetch());
        return () => cancelAnimationFrame(frame);
    }, [mobileInfiniteScroll, transactions.length, loading, loadingMore, checkPrefetch]);

    const renderMobileListContent = (infiniteScroll = false) => {
        if (infiniteScroll && loading && !loadingMore) {
            return (
                <div className="flex min-h-[200px] items-center justify-center">
                    <Loader />
                </div>
            );
        }

        if (loading && transactions.length === 0) {
            return (
                <div className="flex min-h-[200px] items-center justify-center">
                    <Loader />
                </div>
            );
        }

        if (error && transactions.length === 0) {
            return (
                <p className="heading-6 m-0 py-8 text-center text-[var(--secondary-text)]">
                    {lang.walletPage.transactionsError}
                </p>
            );
        }

        if (transactions.length === 0) {
            return (
                <div
                    className={cn(
                        'rounded-xl border border-[var(--rating-border-primary)] bg-[var(--white)]',
                        infiniteScroll &&
                            'mx-4 flex min-h-full flex-1 flex-col justify-center'
                    )}
                >
                    <WalletTransactionsEmptyState
                        className={infiniteScroll ? 'min-h-full' : undefined}
                    />
                </div>
            );
        }

        return (
            <div
                className={cn(
                    'relative',
                    infiniteScroll && 'flex flex-col gap-2 px-4',
                    loading && !loadingMore && 'opacity-55'
                )}
            >
                {transactions.map((txn) => (
                    <MobileTransactionRow
                        key={txn.id}
                        txn={txn}
                        onClick={() => setSelectedTransaction(txn)}
                    />
                ))}
                {infiniteScroll && loadingMore ? (
                    <div className="flex justify-center py-4">
                        <Loader />
                    </div>
                ) : null}
                {loading && !loadingMore && !infiniteScroll ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-[var(--primary-background)]/65">
                        <Loader />
                    </div>
                ) : null}
            </div>
        );
    };

    return (
        <>
            {/* Mobile: recent transactions preview */}
            <section className="mt-6 w-full min-w-0 text-[var(--primary-text)] md:hidden">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="heading-4 font-700 m-0">
                        {lang.walletPage.recentTransactions}
                    </h2>
                    {showViewAll ? (
                        <button
                            type="button"
                            onClick={handleOpenMobileFullHistory}
                            className="heading-6 font-500 shrink-0 cursor-pointer border-0 bg-transparent p-0 text-[var(--accent-color)]"
                        >
                            {lang.viewAll}
                        </button>
                    ) : null}
                </div>
                {renderMobileListContent()}
            </section>

            {/* Mobile: full transaction history overlay (same page) */}
            {showMobileFullHistory ? (
                <div
                    className="fixed inset-0 z-[1050] flex flex-col bg-[var(--primary-background)] text-[var(--primary-text)] md:hidden"
                    role="dialog"
                    aria-modal="true"
                    aria-label={lang.walletPage.transactionHistory}
                >
                    <div className="flex items-center gap-3 border-b border-[var(--rating-border-primary)] px-4 py-4">
                        <Icon
                            icon={`${ARROW_LEFT_ICON}#arrow`}
                            unit="px"
                            color="var(--primary-text)"
                            className="shrink-0 cursor-pointer"
                            viewBox="0 0 22 17"
                            onClick={handleCloseMobileFullHistory}
                        />
                        <h2 className="heading-4 font-700 m-0">
                            {lang.walletPage.transactionHistory}
                        </h2>
                    </div>

                    <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-0 bg-[var(--primary-background)]">
                        <div className="mb-4 shrink-0 bg-[var(--tertiary-background)]">
                            <FilterTabs
                                filter={filter}
                                filterLabels={filterLabels}
                                onFilterChange={handleFilterChange}
                                ariaLabel={lang.walletPage.transactionHistory}
                                isMobileSurface
                            />
                        </div>

                        <div
                            ref={mobileScrollRef}
                            className="min-h-0 flex-1 overflow-y-auto pb-6 bg-[var(--tertiary-background)]"
                        >
                            {renderMobileListContent(true)}
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Desktop: table / full-height empty state */}
            <section className="mt-6 hidden w-full min-w-0 rounded-2xl bg-[var(--primary-background)] pb-4 text-[var(--primary-text)] md:mt-0 md:flex md:min-h-0 md:flex-1 md:flex-col md:bg-[var(--tertiary-background)] md:p-6">
                <div className="mb-4 flex shrink-0 flex-col gap-3.5 md:flex-row md:items-center md:justify-between md:gap-4">
                    <h2 className="heading-4 font-700 m-0">
                        {lang.walletPage.transactionHistory}
                    </h2>
                    <FilterTabs
                        filter={filter}
                        filterLabels={filterLabels}
                        onFilterChange={handleFilterChange}
                        ariaLabel={lang.walletPage.transactionHistory}
                        />
                </div>

                <div
                    className={cn(
                        isHistoryEmpty && 'flex min-h-0 flex-1 flex-col'
                    )}
                >
                <div
                    className={cn(
                        'relative rounded-xl border border-[var(--rating-border-primary)] bg-[var(--white)]',
                        isHistoryEmpty
                            ? 'flex min-h-0 flex-1 flex-col overflow-hidden'
                            : 'overflow-x-auto'
                    )}
                >
                    {loading && transactions.length === 0 ? (
                        <div className="flex min-h-[280px] flex-1 items-center justify-center md:min-h-0">
                            <Loader />
                        </div>
                    ) : error && transactions.length === 0 ? (
                        <p className="heading-6 m-0 flex min-h-[280px] flex-1 items-center justify-center px-4 text-center text-[var(--secondary-text)] md:min-h-0">
                            {lang.walletPage.transactionsError}
                        </p>
                    ) : transactions.length === 0 ? (
                        <WalletTransactionsEmptyState />
                    ) : (
                        <>
                            <table className="w-full min-w-[640px] border-collapse">
                                <thead>
                                    <tr>
                                        <th className="heading-6 font-600 border-b border-[var(--rating-border-primary)] bg-[var(--transaction-history-bg)] px-3.5 py-3 text-left text-[var(--secondary-text)]">
                                            {lang.walletPage.colDateTime}
                                        </th>
                                        <th className="heading-6 font-600 border-b border-[var(--rating-border-primary)] bg-[var(--transaction-history-bg)] px-3.5 py-3 text-left text-[var(--secondary-text)]">
                                            {lang.walletPage.colTransactionId}
                                        </th>
                                        <th className="heading-6 font-600 border-b border-[var(--rating-border-primary)] bg-[var(--transaction-history-bg)] px-3.5 py-3 text-left text-[var(--secondary-text)]">
                                            {lang.walletPage.colDescription}
                                        </th>
                                        <th className="heading-6 font-600 border-b border-[var(--rating-border-primary)] bg-[var(--transaction-history-bg)] px-3.5 py-3 text-right text-[var(--secondary-text)]">
                                            {lang.walletPage.colAmount}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((txn) => (
                                        <tr
                                            key={txn.id}
                                            className={cn(
                                                loading && 'opacity-55',
                                                'border-b border-[var(--transaction-history-bg)] bg-[var(--tertiary-background)]'
                                            )}
                                        >
                                            <td className="p-3 align-top">
                                                <p className="heading-6 font-400 m-0 mb-0.5 text-[var(--primary-text)]">
                                                    {txn.dateLabel || '—'}
                                                </p>
                                                <p className="heading-6 font-400 m-0 text-[var(--secondary-text)]">
                                                    {txn.timeLabel}
                                                </p>
                                            </td>
                                            <td className="p-3 align-top">
                                                <p className="heading-6 font-400 m-0 text-[var(--primary-text)]">
                                                    {txn.txnCode || txn.transactionId}
                                                </p>
                                            </td>
                                            <td className="p-3 align-top">
                                                <p className="heading-6 font-400 m-0 mb-0.5 text-[var(--primary-text)]">
                                                    {txn.title}
                                                </p>
                                                {txn.webSubtitle ?? txn.subtitle ?? txn.pointsExpiryLabel ? (
                                                    <p className="extra-small-font font-400 m-0 text-[var(--secondary-text)]">
                                                        {[
                                                            txn.webSubtitle ?? txn.subtitle,
                                                            txn.pointsExpiryLabel
                                                                ? `${lang.walletPage.expiry} ${txn.pointsExpiryLabel}`
                                                                : undefined,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(' · ')}
                                                    </p>
                                                ) : null}
                                            </td>
                                            <td className="p-3 text-right align-top">
                                                <div className="flex flex-col items-start gap-1.5">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {txn.currencyType === 'points' ? (
                                                            <img
                                                                src={COIN_ICON}
                                                                alt=""
                                                                width={16}
                                                                height={16}
                                                                className="shrink-0"
                                                            />
                                                        ) : null}
                                                        <span className="heading-6 font-500 leading-tight text-[var(--primary-text)]">
                                                            {formatAmount(txn)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-end gap-1">
                                                        <img
                                                            src={
                                                                txn.statusKind === 'credit'
                                                                    ? WALLET_CREDIT_ICON
                                                                    : WALLET_DEBIT_ICON
                                                            }
                                                            alt=""
                                                            width={12}
                                                            height={12}
                                                            className="block h-3 w-3 shrink-0"
                                                        />
                                                        <span
                                                            className={cn(
                                                                'heading-6 font-500 leading-tight',
                                                                txn.statusKind === 'credit'
                                                                    ? 'text-[var(--success)]'
                                                                    : 'text-[var(--error)]'
                                                            )}
                                                        >
                                                            {getStatusLabel(txn)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {loading && transactions.length > 0 ? (
                                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/65">
                                    <Loader />
                                </div>
                            ) : null}
                        </>
                    )}
                </div>

                <div className="mt-3.5 flex shrink-0 flex-col justify-between gap-3 lg:flex-row">
                    <p className="heading-6 font-400 m-0 text-[var(--secondary-text)]">
                        {showingText}
                    </p>
                    {totalPages > 1 ? (
                        <nav
                            className="flex flex-wrap items-center gap-1.5"
                            aria-label={lang.walletPage.paginationLabel}
                        >
                            <CustomButton
                                type="button"
                                className={cn(paginationBtnClass, 'text-lg leading-none !bg-[var(--transaction-history-bg)]')}
                                styles={getPaginationButtonStyles(false)}
                                disabled={page <= 1 || loading}
                                onClick={() => handlePageChange(page - 1)}
                            >
                                ‹
                            </CustomButton>
                            {pageItems.map((item, index) =>
                                item === 'ellipsis' ? (
                                    <span
                                        key={`ellipsis-${index}`}
                                        className="heading-6 px-1 text-[var(--secondary-text)]"
                                    >
                                        …
                                    </span>
                                ) : (
                                    <CustomButton
                                        key={item}
                                        type="button"
                                        className={paginationBtnClass}
                                        styles={getPaginationButtonStyles(page === item)}
                                        disabled={loading}
                                        onClick={() => handlePageChange(item)}
                                    >
                                        {item}
                                    </CustomButton>
                                )
                            )}
                            <CustomButton
                                type="button"
                                className={cn(paginationBtnClass, 'text-lg leading-none !bg-[var(--transaction-history-bg)]')}
                                styles={getPaginationButtonStyles(false)}
                                disabled={page >= totalPages || loading}
                                onClick={() => handlePageChange(page + 1)}
                            >
                                ›
                            </CustomButton>
                        </nav>
                    ) : null}
                </div>
                </div>
            </section>

            {selectedTransaction ? (
                <CustomDialog
                    open={selectedTransaction !== null}
                    anchor="bottom"
                    type="walletTransactionDetail"
                    propsData={{ transaction: selectedTransaction }}
                    handlerDialog={() => {}}
                    handleClose={() => setSelectedTransaction(null)}
                    forceDrawer
                    drawerBorderRadius="12px"
                    sxStyle={{
                        '& .MuiPaper-root': {
                            maxWidth: '420px',
                            height: '100%',
                            borderRadius: '12px',
                            margin: '0 auto',
                            // bottom: '30px',
                            backgroundColor: 'var(--primary-background)',
                        },
                        '& .mobile-drawer-content': {
                            display: 'flex',
                            flex: 1,
                            flexDirection: 'column',
                            minHeight: 0,
                            height: '100%',
                        },
                        '& .MuiDialogContent-root': {
                            padding: 0,
                        },
                    }}
                />
            ) : null}
        </>
    );
};

export default WalletTransactionHistory;
