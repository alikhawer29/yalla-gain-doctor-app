import { useCallback, useMemo, useState } from 'react';
import {
  useGetDashboardBookingsGraphQuery,
  useGetDashboardEarningsGraphQuery,
  useGetDashboardStatsQuery,
} from '../../redux/Apis/User';

export const DASHBOARD_GRAPH_FILTERS = [
  { label: 'Weekly', value: 'weekly' as const },
  { label: 'Monthly', value: 'monthly' as const },
  { label: 'Yearly', value: 'yearly' as const },
];

export type DashboardGraphFilter = 'weekly' | 'monthly' | 'yearly';

type GraphRow = {
  day?: string;
  date?: string;
  month?: string;
  earnings?: number;
  bookings?: number;
};

function labelForRow(row: GraphRow): string {
  if (row.day) return String(row.day).slice(0, 3);
  if (row.date) {
    const parts = row.date.split('-');
    const d = parts[2] ? String(Number(parts[2])) : row.date;
    return d;
  }
  if (row.month) return String(row.month).slice(0, 3);
  return '';
}

/** Thin X-axis labels so monthly/yearly charts do not clip at the edges. */
function maskXLabels(labels: string[], step: number): string[] {
  const n = Math.max(1, step);
  return labels.map((label, i) => (i % n === 0 ? label : ''));
}

function rowsToLineChart(
  rows: GraphRow[] | undefined,
  valueKey: 'earnings' | 'bookings',
  filter: DashboardGraphFilter,
) {
  const list = Array.isArray(rows) ? rows : [];
  if (list.length === 0) {
    return {
      labels: ['—'],
      datasets: [{ data: [0] }],
    };
  }
  let labels = list.map(labelForRow);
  if (filter === 'monthly' && labels.length > 10) {
    labels = maskXLabels(labels, 3);
  } else if (filter === 'yearly' && labels.length > 6) {
    labels = maskXLabels(labels, 2);
  } else if (filter === 'weekly' && labels.length > 7) {
    labels = maskXLabels(labels, 2);
  }
  return {
    labels,
    datasets: [
      {
        data: list.map(r => Number((r as any)[valueKey] ?? 0)),
      },
    ],
  };
}

const useDashboardController = () => {
  const [earningsFilter, setEarningsFilter] =
    useState<DashboardGraphFilter>('yearly');
  const [bookingsFilter, setBookingsFilter] =
    useState<DashboardGraphFilter>('yearly');

  const {
    data: statsRes,
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = useGetDashboardStatsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const {
    data: earningsRes,
    isLoading: isEarningsGraphLoading,
    refetch: refetchEarnings,
  } = useGetDashboardEarningsGraphQuery(
    { filter: earningsFilter },
    { refetchOnMountOrArgChange: true },
  );

  const {
    data: bookingsRes,
    isLoading: isBookingsGraphLoading,
    refetch: refetchBookings,
  } = useGetDashboardBookingsGraphQuery(
    { filter: bookingsFilter },
    { refetchOnMountOrArgChange: true },
  );

  const [isRefreshing, setIsRefreshing] = useState(false);

  const total_bookings = statsRes?.data?.total_bookings ?? 0;
  const total_coins = statsRes?.data?.total_coins ?? 0;
  const paid_out = statsRes?.data?.paid_out ?? 0;
  const pending_payout = statsRes?.data?.pending_payout ?? 0;
  const total_tips_received = statsRes?.data?.total_tips_received ?? 0;

  const earningsLineData = useMemo(
    () => rowsToLineChart(earningsRes?.data, 'earnings', earningsFilter),
    [earningsRes?.data, earningsFilter],
  );

  const bookingsLineData = useMemo(
    () => rowsToLineChart(bookingsRes?.data, 'bookings', bookingsFilter),
    [bookingsRes?.data, bookingsFilter],
  );

  const onEarningsFilterChange = (item: { value?: string } | null) => {
    const v = item?.value as DashboardGraphFilter | undefined;
    if (v === 'weekly' || v === 'monthly' || v === 'yearly') {
      setEarningsFilter(v);
    }
  };

  const onBookingsFilterChange = (item: { value?: string } | null) => {
    const v = item?.value as DashboardGraphFilter | undefined;
    if (v === 'weekly' || v === 'monthly' || v === 'yearly') {
      setBookingsFilter(v);
    }
  };

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchStats(),
        refetchEarnings(),
        refetchBookings(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchStats, refetchEarnings, refetchBookings]);

  return {
    values: {
      total_bookings,
      total_coins,
      paid_out,
      pending_payout,
      total_tips_received,
      earningsLineData,
      bookingsLineData,
      earningsFilter,
      bookingsFilter,
      graphFilterOptions: DASHBOARD_GRAPH_FILTERS,
      isStatsLoading,
      isEarningsGraphLoading,
      isBookingsGraphLoading,
      isRefreshing,
    },
    functions: {
      onEarningsFilterChange,
      onBookingsFilterChange,
      onRefresh,
    },
  };
};

export default useDashboardController;
