import { useIsFocused, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { useGetBookingHistoryQuery } from '../../redux/Apis/User';
import { navigate } from '../../utils/navigation';
import { ROUTES } from '../../utils/routes';
import useSearch from '../../hooks/useSearch';
import useToggle from '../../hooks/useToggle';

export const STATUS_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Past', value: 'past' },
];

const useUserHistoryController = () => {
  const isFocused = useIsFocused();
  const { params } = useRoute();
  const { search, debouncedSearch, onChange: onSearch } = useSearch();

  const [toggleFilterModal, filterModalVisible] = useToggle();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [status, setStatus] = useState<{ label: string; value: string } | null>(
    null,
  );

  const [appliedFilters, setAppliedFilters] = useState({
    from_date: '',
    to_date: '',
    type: '',
  });

  const { data, refetch, isLoading } = useGetBookingHistoryQuery({
    id: params?.id,
    search: debouncedSearch,
    from_date: appliedFilters.from_date || undefined,
    to_date: appliedFilters.to_date || undefined,
    type: appliedFilters.type || undefined,
  });

  useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused]);

  const onPressCard = (id: number) => {
    navigate(ROUTES.BOOKING_DETAILS, { id });
  };

  const onApplyFilters = () => {
    setAppliedFilters({
      from_date: fromDate,
      to_date: toDate,
      type: status?.value || '',
    });
    toggleFilterModal();
  };

  const onClearFilters = () => {
    setFromDate('');
    setToDate('');
    setStatus(null);
    setAppliedFilters({
      from_date: '',
      to_date: '',
      type: '',
    });
    toggleFilterModal();
  };

  return {
    values: {
      data: data || null,
      isLoading,
      search,
      filterModalVisible,
      fromDate,
      toDate,
      status,
    },
    functions: {
      onReload: refetch,
      onPressCard,
      onSearch,
      toggleFilterModal,
      setFromDate,
      setToDate,
      setStatus,
      onApplyFilters,
      onClearFilters,
    },
  };
};

export default useUserHistoryController;
