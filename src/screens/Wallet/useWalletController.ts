import { useCallback, useMemo, useState } from 'react';
import { useRefreshOnScreenFocus } from '../../hooks/useRefreshOnScreenFocus';
import { useGetWalletQuery } from '../../redux/Apis/User';
import { navigate } from '../../utils/navigation';
import { ROUTES } from '../../utils/routes';
import {
  getAvailableBalanceAed,
  pickWalletPayload,
} from '../../utils/walletPayload';

const useWalletController = () => {
  const {
    data: walletRaw,
    isLoading: isWalletLoading,
    refetch,
  } = useGetWalletQuery(undefined);
  const [refreshing, setRefreshing] = useState(false);

  useRefreshOnScreenFocus(refetch);

  const walletData = useMemo(() => pickWalletPayload(walletRaw), [walletRaw]);
  const availableAed = useMemo(
    () => getAvailableBalanceAed(walletData),
    [walletData],
  );
  const coinAmount = Number(walletData?.coin_amount ?? 1) || 1;
  const myCoins = Number(walletData?.my_coins ?? 0) || 0;
  const balanceCurrency = walletData?.balance_currency?.trim() || 'AED';

  const handleWithdraw = () => {
    navigate(ROUTES.BENEFICIARIES);
  };

  const handleManageBeneficiaries = () => {
    navigate(ROUTES.BENEFICIARIES);
  };

  const handleTransactionLogs = () => {
    navigate(ROUTES.WALLET_TRANSACTION_LOGS);
  };

  const onRefreshWallet = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  return {
    walletData,
    availableAed,
    balanceCurrency,
    myCoins,
    coinAmount,
    isWalletLoading,
    refreshing,
    onRefreshWallet,
    handleWithdraw,
    handleManageBeneficiaries,
    handleTransactionLogs,
  };
};

export default useWalletController;
