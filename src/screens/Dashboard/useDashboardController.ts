import { useMemo, useState } from 'react';
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

/** Show every other X label (1, _, 3, _) so monthly charts are readable. */
function maskEveryOtherXLabel(labels: string[]): string[] {
  return labels.map((label, i) => (i % 2 === 0 ? label : ''));
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
  if (
    (filter === 'monthly' && labels.length > 7) ||
    (filter === 'yearly' && labels.length > 6)
  ) {
    labels = maskEveryOtherXLabel(labels);
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
    useState<DashboardGraphFilter>('weekly');
  const [bookingsFilter, setBookingsFilter] =
    useState<DashboardGraphFilter>('weekly');

  const { data: statsRes, isLoading: isStatsLoading } =
    useGetDashboardStatsQuery(undefined, {
      refetchOnMountOrArgChange: true,
    });

  const { data: earningsRes, isLoading: isEarningsGraphLoading } =
    useGetDashboardEarningsGraphQuery(
      { filter: earningsFilter },
      { refetchOnMountOrArgChange: true },
    );

  const { data: bookingsRes, isLoading: isBookingsGraphLoading } =
    useGetDashboardBookingsGraphQuery(
      { filter: bookingsFilter },
      { refetchOnMountOrArgChange: true },
    );

  const total_bookings = statsRes?.data?.total_bookings ?? 0;
  const total_earnings = statsRes?.data?.total_earnings ?? 0;

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

  return {
    values: {
      total_bookings,
      total_earnings,
      earningsLineData,
      bookingsLineData,
      earningsFilter,
      bookingsFilter,
      graphFilterOptions: DASHBOARD_GRAPH_FILTERS,
      isStatsLoading,
      isEarningsGraphLoading,
      isBookingsGraphLoading,
    },
    functions: {
      onEarningsFilterChange,
      onBookingsFilterChange,
    },
  };
};

export default useDashboardController;
