import { useCallback, useMemo } from 'react';
import { useGetUaeBeneficiariesQuery } from '../../redux/Apis/User';
import { navigate } from '../../utils/navigation';
import { ROUTES } from '../../utils/routes';
import { parseUaeBeneficiariesList } from '../../utils/walletUae';
import type { UaeBeneficiary } from '../../redux/Apis/User';

const useBeneficiariesController = () => {
  const { data, isLoading, isFetching, isError, refetch } =
    useGetUaeBeneficiariesQuery();

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
