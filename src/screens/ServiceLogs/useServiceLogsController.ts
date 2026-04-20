import { useIsFocused } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { CommonActions } from '@react-navigation/native';
import useSearch from '../../hooks/useSearch';
import { useGetBookingsQuery } from '../../redux/Apis/User';
import { STATUSES } from '../../utils/data';
import { navigationRef } from '../../utils/navigation';
import { NAVIGATORS, ROUTES } from '../../utils/routes';
import useToggle from '../../hooks/useToggle';

const useServiceLogsController = () => {
  const isFocused = useIsFocused();
  const [selected, setSelected] = useState(STATUSES[0]?.value);

  const { search, debouncedSearch, onChange: onSearch } = useSearch();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [toggleFilterModal, filterModalVisible] = useToggle();

  const [appliedFilters, setAppliedFilters] = useState({
    from: '',
    to: '',
  });

  const {
    data,
    isFetching: isLoading,
    refetch,
  } = useGetBookingsQuery({
    type: selected === 'all' ? '' : selected,
    search: debouncedSearch,
    from: appliedFilters.from || undefined,
    to: appliedFilters.to || undefined,
  });

  useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused]);

  const onPressCard = (id: number) => {
    if (navigationRef.isReady()) {
      navigationRef.navigate(NAVIGATORS.BOOKING_STACK, {
        screen: ROUTES.BOOKING_DETAILS,
        params: { id },
      });
    }
  };

  const onRequests = () => {
    if (navigationRef.isReady()) {
      navigationRef.navigate(NAVIGATORS.BOOKING_STACK, {
        screen: ROUTES.APPOINTMENT_REQUESTS,
      });
    }
  };

  const onChangeStatus = (status: string) => setSelected(status);

  const onApplyFilters = () => {
    setAppliedFilters({
      from: fromDate,
      to: toDate,
    });
    toggleFilterModal();
  };

  const onClearFilters = () => {
    setFromDate('');
    setToDate('');
    setAppliedFilters({
      from: '',
      to: '',
    });
    toggleFilterModal();
  };
  return {
    values: {
      data: data?.data || [],
      isLoading,
      selected,
      search,
      filterModalVisible,
      fromDate,
      toDate,
      appliedFilters,
    },
    functions: {
      onReload: refetch,
      onPressCard,
      onRequests,
      onChangeStatus,
      onSearch,
      setFromDate,
      setToDate,
      onApplyFilters,
      onClearFilters,
      toggleFilterModal,
    },
  };
};

export default useServiceLogsController;
