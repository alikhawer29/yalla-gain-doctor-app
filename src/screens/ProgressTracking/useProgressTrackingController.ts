import { useMemo, useState } from 'react';
import { useRoute } from '@react-navigation/native';
import { skipToken } from '@reduxjs/toolkit/query';
import { useGetHealthProgressQuery } from '../../redux/Apis/User';

const currentYear = new Date().getFullYear();

const useProgressTrackingController = () => {
  const route = useRoute();
  const userId = (route.params as { id?: string | number } | undefined)?.id;

  const [caloriesFilter, setCaloriesFilter] = useState<'weekly' | 'monthly'>(
    'weekly',
  );
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const queryArgs =
    userId != null && userId !== ''
      ? {
          userId: Number(userId),
          calories_filter: caloriesFilter,
          year: selectedYear,
        }
      : skipToken;

  const { data: response, isFetching, isError, refetch } =
    useGetHealthProgressQuery(queryArgs);

  const health = response?.data;
  /** First request in flight before any successful payload (for skeleton spinners). */
  const isBootstrapping = isFetching && response === undefined;

  const bmiChartData = useMemo(
    () => health?.bmi_monthly_graph ?? [],
    [health?.bmi_monthly_graph],
  );

  const caloriesLineData = useMemo(() => {
    const pts = health?.calories_graph?.data ?? [];
    const rawLabels = pts.map((p, i) => {
      const d = String(p.day ?? '').trim();
      if (!d) return String(i + 1);
      if (d.length <= 4) return d;
      return d.slice(0, 3);
    });
    /** Monthly: show every other x-axis label — thin space keeps chart-kit layout (empty string hides ticks). */
    const labels =
      caloriesFilter === 'monthly'
        ? rawLabels.map((lb, i) => (i % 2 === 0 ? lb : '\u2009'))
        : rawLabels;
    const vals = pts.map(p => Number(p.calories) || 0);
    const dataVals = vals.length ? vals : [0];
    return {
      labels: labels.length ? labels : ['—'],
      datasets: [{ data: dataVals }],
    };
  }, [health?.calories_graph?.data, caloriesFilter]);

  const totalSteps = Math.round(Number(health?.total_steps) || 0);
  const totalCaloriesRaw = Number(health?.total_calories);
  const totalCalories = Number.isFinite(totalCaloriesRaw) ? totalCaloriesRaw : 0;

  const caloriesProgressPct = useMemo(() => {
    const goal = 3000;
    if (totalCalories <= 0) return 0;
    const pct = Math.min(100, (totalCalories / goal) * 100);
    /** Keep a tiny visible arc for positive totals far below the daily goal. */
    if (pct > 0 && pct < 0.5) return 0.5;
    return Math.round(pct);
  }, [totalCalories]);

  const yearOptions = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => {
        const y = currentYear - i;
        return { label: String(y), value: String(y) };
      }),
    [],
  );

  const caloriesFilterOptions = useMemo(
    () => [
      { label: 'Weekly', value: 'weekly' },
      { label: 'Monthly', value: 'monthly' },
    ],
    [],
  );

  return {
    values: {
      userId,
      health,
      isBootstrapping,
      isError,
      bmiChartData,
      caloriesLineData,
      totalSteps,
      totalCalories,
      caloriesProgressPct,
      caloriesFilter,
      selectedYear,
      yearOptions,
      caloriesFilterOptions,
    },
    functions: {
      setCaloriesFilter,
      setSelectedYear,
      refetch,
      onChangeYear: (item: { value?: string } | null) => {
        const v = item?.value;
        if (v == null || v === '') return;
        const n = Number(v);
        if (!Number.isNaN(n)) setSelectedYear(n);
      },
      onChangeCaloriesFilter: (item: { value?: string } | null) => {
        const v = item?.value;
        if (v === 'weekly' || v === 'monthly') setCaloriesFilter(v);
      },
    },
  };
};

export default useProgressTrackingController;
