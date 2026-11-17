import {
    TransactionFilter,
    TransactionHistoryItem,
    TransactionListData,
} from '@components/type/transaction.types';
import { getTransactions } from '@services/transactionService';
import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_LIMIT = 12;

export interface UseWalletTransactionsOptions {
    userId: string | null | undefined;
    limit?: number;
    /** When true, page > 1 appends results instead of replacing (infinite scroll). */
    accumulatePages?: boolean;
}

export const useWalletTransactions = ({
    userId,
    limit = DEFAULT_LIMIT,
    accumulatePages = false,
}: UseWalletTransactionsOptions) => {
    const [filter, setFilter] = useState<TransactionFilter>('all');
    const [page, setPage] = useState(1);
    const [transactions, setTransactions] = useState<TransactionHistoryItem[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const abortControllerRef = useRef<AbortController | null>(null);
    const requestSequenceRef = useRef(0);

    const fetchTransactions = useCallback(
        async (
            targetUserId: string,
            targetPage: number,
            targetFilter: TransactionFilter
        ): Promise<TransactionListData | null> => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            const abortController = new AbortController();
            abortControllerRef.current = abortController;
            const currentSequence = ++requestSequenceRef.current;

            const isAppendFetch = accumulatePages && targetPage > 1;
            if (isAppendFetch) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }
            setError(null);

            try {
                const response = await getTransactions({
                    userId: targetUserId,
                    page: targetPage,
                    limit,
                    filter: targetFilter,
                });

                if (
                    !abortController.signal.aborted &&
                    currentSequence === requestSequenceRef.current
                ) {
                    if (isAppendFetch) {
                        setTransactions((prev) => {
                            const existingIds = new Set(prev.map((txn) => txn.id));
                            const nextItems = response.transactions.filter(
                                (txn) => !existingIds.has(txn.id)
                            );
                            return [...prev, ...nextItems];
                        });
                    } else {
                        setTransactions(response.transactions);
                    }
                    setTotalCount(response.totalCount);
                }

                return response;
            } catch (err: unknown) {
                if (
                    !abortController.signal.aborted &&
                    currentSequence === requestSequenceRef.current
                ) {
                    if (
                        (err as { name?: string })?.name !== 'AbortError' &&
                        (err as { name?: string })?.name !== 'CanceledError'
                    ) {
                        setError('Failed to fetch transactions.');
                        setTransactions([]);
                        setTotalCount(0);
                    }
                }
                return null;
            } finally {
                if (currentSequence === requestSequenceRef.current) {
                    setLoading(false);
                    setLoadingMore(false);
                }
            }
        },
        [limit, accumulatePages]
    );

    useEffect(() => {
        if (!userId) {
            setTransactions([]);
            setTotalCount(0);
            return;
        }

        fetchTransactions(userId, page, filter).catch(() => undefined);
    }, [userId, page, filter, fetchTransactions]);

    const handleFilterChange = useCallback((nextFilter: TransactionFilter) => {
        setFilter(nextFilter);
        setPage(1);
    }, []);

    const handlePageChange = useCallback((nextPage: number) => {
        setPage(nextPage);
    }, []);

    const totalPages = Math.max(1, Math.ceil(totalCount / limit));
    const rangeStart = totalCount === 0 ? 0 : (page - 1) * limit + 1;
    const rangeEnd = Math.min(page * limit, totalCount);
    const hasMore = page < totalPages;

    return {
        filter,
        page,
        limit,
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
        refetch: () => (userId ? fetchTransactions(userId, page, filter) : Promise.resolve(null)),
        refetchTransactions: (options?: { fromStart?: boolean }) => {
            if (!userId) return Promise.resolve(null);
            if (options?.fromStart) {
                if (page !== 1) {
                    setPage(1);
                    return Promise.resolve(null);
                }
                return fetchTransactions(userId, 1, filter);
            }
            return fetchTransactions(userId, page, filter);
        },
    };
};

export default useWalletTransactions;
