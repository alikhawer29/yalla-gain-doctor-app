import { RouteProp, useRoute } from '@react-navigation/native';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { syncUserCoins } from '../../redux/Slices/AuthSlice';
import {
  useGetWalletQuery,
  useWithdrawUaeBeneficiaryMutation,
} from '../../redux/Apis/User';
import { useModal } from '../../contexts/ModalContext';
import { navigate } from '../../utils/navigation';
import { ROUTES } from '../../utils/routes';
import { maskIban } from '../../utils/walletUae';
import type { AppStackParamList } from '../../interfaces';
import {
  getAvailableBalanceAed,
  pickWalletPayload,
} from '../../utils/walletPayload';

const useWithdrawBeneficiaryController = () => {
  const dispatch = useDispatch();
  const route = useRoute<RouteProp<AppStackParamList, 'WithdrawBeneficiary'>>();
  const beneficiary = route.params?.beneficiary;
  const { showOkModal } = useModal() as {
    showOkModal: (data: object, onConfirm?: () => void) => void;
  };

  const { data: walletRaw, refetch: refetchWallet } = useGetWalletQuery(undefined);
  const [withdraw, { isLoading }] = useWithdrawUaeBeneficiaryMutation();

  const wallet = pickWalletPayload(walletRaw);
  const coinAmount = Number(wallet?.coin_amount ?? 1) || 1;
  const myCoins = Number(wallet?.my_coins ?? 0) || 0;
  const availableAed = getAvailableBalanceAed(wallet);
  const balanceCurrency = wallet?.balance_currency?.trim() || 'AED';

  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState('');

  const onChangeAmount = (v: string) => {
    setAmount(v);
    if (amountError) setAmountError('');
  };

  const validate = () => {
    const n = parseFloat(amount.replace(/,/g, ''));
    if (!amount.trim() || Number.isNaN(n) || n <= 0) {
      setAmountError('Enter an amount greater than 0');
      return false;
    }
    const nCents = Math.round(n * 100);
    const maxCents = Math.round(availableAed * 100);
    if (nCents > maxCents) {
      setAmountError('Amount exceeds available balance');
      return false;
    }
    setAmountError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!beneficiary?.id || !validate()) return;
    const n = parseFloat(amount.replace(/,/g, ''));
    try {
      const res = await withdraw({
        beneficiaryId: beneficiary.id,
        amount: n,
      }).unwrap();

      const { data: freshWallet } = await refetchWallet();
      const w = pickWalletPayload(freshWallet);
      const coins = w?.my_coins;
      if (coins != null && coins !== '') {
        dispatch(syncUserCoins(coins as string | number));
      }

      const d = res?.data;
      const statusLabel = d?.status || 'Pending';
      const remaining =
        d?.remaining_coins != null
          ? String(d.remaining_coins)
          : coins != null
            ? String(coins)
            : '—';

      showOkModal(
        {
          type: 'success',
          title: 'Withdrawal submitted',
          message: `Status: ${statusLabel}\nAmount: ${n} AED\nRemaining coins: ${remaining}`,
        },
        () => navigate(ROUTES.WALLET_TRANSACTION_LOGS),
      );
    } catch {
      // RTK error toast is handled by api middleware
    }
  };

  return {
    beneficiary,
    maskIban,
    availableAed,
    balanceCurrency,
    myCoins,
    coinAmount,
    amount,
    amountError,
    isLoading,
    onChangeAmount,
    handleSubmit,
  };
};

export default useWithdrawBeneficiaryController;
