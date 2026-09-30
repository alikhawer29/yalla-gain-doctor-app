import { useCallback, useMemo } from 'react';
import { useRefreshOnScreenFocus } from '../../hooks/useRefreshOnScreenFocus';
import {
  useGetUaeBeneficiariesQuery,
  type UaeBeneficiary,
} from '../../redux/Apis/User';
import { navigate } from '../../utils/navigation';
import { ROUTES } from '../../utils/routes';
import { parseUaeBeneficiariesList } from '../../utils/walletUae';

const useBeneficiariesController = () => {
  const { data, isLoading, isFetching, isError, refetch } =
    useGetUaeBeneficiariesQuery();

  useRefreshOnScreenFocus(refetch);

  const beneficiaries = useMemo(
    () => parseUaeBeneficiariesList(data),
    [data],
  );

  const onAdd = useCallback(() => {
    navigate(ROUTES.ADD_BENEFICIARY);
  }, []);

  const onSelectWithdraw = useCallback((b: UaeBeneficiary) => {
    navigate(ROUTES.WITHDRAW_BENEFICIARY, { beneficiary: b });
  }, []);

  return {
    beneficiaries,
    isLoading,
    isFetching,
    isError,
    refetch,
    onAdd,
    onSelectWithdraw,
  };
};

export default useBeneficiariesController;
