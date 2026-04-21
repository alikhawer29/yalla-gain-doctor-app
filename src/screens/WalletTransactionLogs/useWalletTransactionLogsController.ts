import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  UaeTransactionLogItem,
  useGetUaeTransactionLogsQuery,
} from '../../redux/Apis/User';
import { parseUaeTransactionLogsPage } from '../../utils/walletUae';

const PER_PAGE = 15;

export type StatusFilter = 'all' | 'paid' | 'pending';

const useWalletTransactionLogsController = () => {
  const [status, setStatus] = useState<StatusFilter>('all');
  const [filterFrom, setFilterFrom] = useState<string | undefined>();
  const [filterTo, setFilterTo] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [logs, setLogs] = useState<UaeTransactionLogItem[]>([]);

  const queryArgs = useMemo(
    () => ({
      page,
      per_page: PER_PAGE,
      ...(status !== 'all' ? { status } : {}),
      ...(filterFrom ? { from: filterFrom } : {}),
      ...(filterTo ? { to: filterTo } : {}),
    }),
    [page, status, filterFrom, filterTo],
  );

  const { data, isLoading, isFetching, isError, refetch } =
    useGetUaeTransactionLogsQuery(queryArgs);

  useEffect(() => {
    setPage(1);
    setLogs([]);
  }, [status, filterFrom, filterTo]);

  useEffect(() => {
    const { list, pagination } = parseUaeTransactionLogsPage(data);
    if (!pagination) {
      if (page === 1) setLogs(list);
      return;
    }
    if (pagination.current_page === 1) setLogs(list);
    else setLogs(prev => [...prev, ...list]);
  }, [data, page]);

  const { pagination } = parseUaeTransactionLogsPage(data);

  const loadMore = useCallback(() => {
    if (!pagination || isFetching) return;
    if (pagination.current_page >= pagination.last_page) return;
    setPage(p => p + 1);
  }, [pagination, isFetching]);

  const canLoadMore =
    !!pagination && pagination.current_page < pagination.last_page;

  const isLoadingMore = isFetching && page > 1;

  const applyDateFilter = useCallback((from: string, to: string) => {
    setFilterFrom(from || undefined);
    setFilterTo(to || undefined);
  }, []);

  return {
    values: {
      logs,
      status,
      filterFrom,
      filterTo,
      isLoading: isLoading && page === 1,
      isFetching,
      isError,
      canLoadMore,
      isLoadingMore,
    },
    functions: {
      setStatus,
      loadMore,
      refetch,
      applyDateFilter,
    },
  };
};

export default useWalletTransactionLogsController;
