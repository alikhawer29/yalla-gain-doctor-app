import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Linking, type AppStateStatus } from 'react-native';
import { useModal } from '../../contexts/ModalContext';
import {
  useCreateUaeBeneficiaryMutation,
  useCreateUaeOnboardingLinkMutation,
  useGetUaeBeneficiariesQuery,
  useSyncUaeOnboardingMutation,
} from '../../redux/Apis/User';
import { goBack, navigate } from '../../utils/navigation';
import { ROUTES } from '../../utils/routes';
import {
  isValidUaeIban,
  normalizeIbanInput,
  parseUaeBeneficiariesList,
} from '../../utils/walletUae';

type FormErrors = {
  iban?: string;
  account_holder_name?: string;
  tax_id?: string;
  line1?: string;
  state?: string;
};

const useAddBeneficiaryController = () => {
  const { showOkModal } = useModal();
  const [createLink, { isLoading: isCreatingLink }] =
    useCreateUaeOnboardingLinkMutation();
  const [syncOnboarding, { isLoading: isSyncing }] =
    useSyncUaeOnboardingMutation();
  const [createBeneficiary, { isLoading: isCreating }] =
    useCreateUaeBeneficiaryMutation();
  const { data, refetch: refetchBeneficiaries } = useGetUaeBeneficiariesQuery();

  const beneficiaries = useMemo(
    () => parseUaeBeneficiariesList(data),
    [data],
  );

  /** Already completed Connect once → add extra bank in-app (no hosted onboarding). */
  const hasConnectAccount = useMemo(() => {
    return beneficiaries.some(b => Boolean(b.stripe_account_id)) || beneficiaries.length > 0;
  }, [beneficiaries]);

  const defaults = useMemo(() => {
    const first = beneficiaries[0];
    return {
      account_holder_name: first?.account_holder_name ?? '',
      tax_id: first?.tax_id ?? '',
      line1: first?.line1 ?? '',
      state: first?.state ?? '',
    };
  }, [beneficiaries]);

  const [iban, setIban] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [line1, setLine1] = useState('');
  const [state, setState] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!hasConnectAccount) return;
    setAccountHolderName(prev => prev || defaults.account_holder_name);
    setTaxId(prev => prev || defaults.tax_id);
    setLine1(prev => prev || defaults.line1);
    setState(prev => prev || defaults.state);
  }, [hasConnectAccount, defaults]);

  const [openedStripe, setOpenedStripe] = useState(false);
  const openedAtRef = useRef(0);
  const handlingReturn = useRef(false);

  const finishAfterStripe = useCallback(async () => {
    if (handlingReturn.current) return;
    handlingReturn.current = true;
    try {
      await syncOnboarding().unwrap();
      await refetchBeneficiaries();
      navigate(ROUTES.BENEFICIARIES);
    } catch {
      navigate(ROUTES.BENEFICIARIES);
    } finally {
      handlingReturn.current = false;
      setOpenedStripe(false);
    }
  }, [refetchBeneficiaries, syncOnboarding]);

  useEffect(() => {
    const onChange = (next: AppStateStatus) => {
      if (
        next === 'active' &&
        openedStripe &&
        Date.now() - openedAtRef.current > 2500
      ) {
        finishAfterStripe();
      }
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [finishAfterStripe, openedStripe]);

  const handleContinueWithStripe = async () => {
    try {
      const res = await createLink().unwrap();
      const url = res?.data?.url;
      if (!url) return;
      openedAtRef.current = Date.now();
      setOpenedStripe(true);
      await Linking.openURL(url);
    } catch {
      setOpenedStripe(false);
    }
  };

  const validateForm = (): boolean => {
    const next: FormErrors = {};
    const normalizedIban = normalizeIbanInput(iban);
    if (!isValidUaeIban(normalizedIban)) {
      next.iban = 'Enter a valid UAE IBAN (AE + 21 digits)';
    }
    if (!accountHolderName.trim() || accountHolderName.trim().length < 2) {
      next.account_holder_name = 'Account holder name is required';
    }
    if (!taxId.trim() || taxId.trim().length < 3) {
      next.tax_id = 'Trade licence / tax ID is required';
    }
    if (!line1.trim() || line1.trim().length < 3) {
      next.line1 = 'Address is required';
    }
    if (!state.trim() || state.trim().length < 2) {
      next.state = 'Emirate / state is required';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmitBeneficiary = async () => {
    if (!validateForm()) return;
    try {
      const res = await createBeneficiary({
        iban: normalizeIbanInput(iban),
        account_holder_name: accountHolderName.trim(),
        tax_id: taxId.trim(),
        line1: line1.trim(),
        state: state.trim(),
      }).unwrap();

      if (res?.already_exists) {
        showOkModal({
          type: 'error',
          title: 'Already added',
          message: res?.message || 'This beneficiary already exists.',
        });
        return;
      }

      await refetchBeneficiaries();
      showOkModal(
        {
          type: 'success',
          title: 'Beneficiary added',
          message: res?.message || 'New bank account saved for payouts.',
        },
        () => navigate(ROUTES.BENEFICIARIES),
      );
    } catch (error: any) {
      showOkModal({
        type: 'error',
        title: 'Error',
        message:
          error?.data?.message ||
          error?.error ||
          'Failed to add beneficiary. Please try again.',
      });
    }
  };

  return {
    hasConnectAccount,
    isLoading: isCreatingLink || isSyncing || isCreating,
    openedStripe,
    handleContinueWithStripe,
    handleCancel: goBack,
    form: {
      iban,
      accountHolderName,
      taxId,
      line1,
      state,
      errors,
      setIban,
      setAccountHolderName,
      setTaxId,
      setLine1,
      setState,
    },
    handleSubmitBeneficiary,
  };
};

export default useAddBeneficiaryController;
