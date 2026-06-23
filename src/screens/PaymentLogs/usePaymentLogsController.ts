import { useCallback, useEffect, useMemo, useState } from 'react';
import { PaymentLogItem, useGetPaymentLogsQuery } from '../../redux/Apis/User';

const PER_PAGE = 15;

const usePaymentLogsController = () => {
  const [filterFrom, setFilterFrom] = useState<string | undefined>();
  const [filterTo, setFilterTo] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [logs, setLogs] = useState<PaymentLogItem[]>([]);

  const queryArgs = useMemo(
    () => ({
      ...(filterFrom ? { from: filterFrom } : {}),
      ...(filterTo ? { to: filterTo } : {}),
      page,
      per_page: PER_PAGE,
    }),
    [filterFrom, filterTo, page],
  );

  const { data, isLoading, isFetching, isError, refetch } =
    useGetPaymentLogsQuery(queryArgs);

  useEffect(() => {
    setPage(1);
    setLogs([]);
  }, [filterFrom, filterTo]);

  useEffect(() => {
    const pg = data?.data?.payment_logs;
    if (!pg?.data) return;
    if (pg.current_page === 1) setLogs(pg.data);
    else setLogs(prev => [...prev, ...pg.data]);
  }, [data]);

  const earningsSummary = data?.data?.earnings_summary;
  const pagination = data?.data?.payment_logs;

  const applyDateFilter = useCallback((from: string, to: string) => {
    setFilterFrom(from || undefined);
    setFilterTo(to || undefined);
  }, []);

  const loadMore = useCallback(() => {
    if (!pagination || isFetching) return;
    if (pagination.current_page >= pagination.last_page) return;
    setPage(p => p + 1);
  }, [pagination, isFetching]);

  const canLoadMore =
    !!pagination && pagination.current_page < pagination.last_page;

  const isLoadingMore = isFetching && page > 1;

  return {
    values: {
      logs,
      earningsSummary,
      filterFrom,
      filterTo,
      isLoading: isLoading && page === 1,
      isFetching,
      isError,
      isLoadingMore,
      canLoadMore,
      pagination,
    },
    functions: { applyDateFilter, loadMore, refetch },
  };
};

export default usePaymentLogsController;
