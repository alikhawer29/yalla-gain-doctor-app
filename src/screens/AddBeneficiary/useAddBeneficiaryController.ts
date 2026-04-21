import { useState } from 'react';
import { Alert } from 'react-native';
import {
  useCreateUaeBeneficiaryMutation,
  useGetUaeBeneficiariesQuery,
} from '../../redux/Apis/User';
import { goBack } from '../../utils/navigation';
import {
  isValidUaeIban,
  normalizeIbanInput,
} from '../../utils/walletUae';

const useAddBeneficiaryController = () => {
  const [createBeneficiary, { isLoading }] = useCreateUaeBeneficiaryMutation();
  const { refetch: refetchBeneficiaries } = useGetUaeBeneficiariesQuery();

  const [form, setForm] = useState({
    account_holder_name: '',
    iban: '',
    line1: '',
    tax_id: '',
    state: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => {
        const n = { ...prev };
        delete n[key];
        return n;
      });
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.account_holder_name.trim())
      e.account_holder_name = 'Account holder name is required';
    const ibanNorm = normalizeIbanInput(form.iban);
    if (!ibanNorm) e.iban = 'IBAN is required';
    else if (!isValidUaeIban(form.iban))
      e.iban = 'Enter a valid UAE IBAN (AE + 21 digits)';
    if (!form.line1.trim()) e.line1 = 'Address line is required';
    if (!form.tax_id.trim()) e.tax_id = 'Tax ID is required';
    if (!form.state.trim()) e.state = 'State / emirate is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const body = {
        account_holder_name: form.account_holder_name.trim(),
        iban: normalizeIbanInput(form.iban),
        line1: form.line1.trim(),
        tax_id: form.tax_id.trim(),
        state: form.state.trim(),
      };
      const res = await createBeneficiary(body).unwrap();
      if (res?.already_exists) {
        Alert.alert(
          'Beneficiary exists',
          'This beneficiary already exists.',
          [
            {
              text: 'Use existing',
              onPress: async () => {
                await refetchBeneficiaries();
                goBack();
              },
            },
            { text: 'OK', style: 'cancel', onPress: () => goBack() },
          ],
        );
        return;
      }
      await refetchBeneficiaries();
      goBack();
    } catch {
      // RTK error toast is handled by api middleware
    }
  };

  return {
    form,
    errors,
    isLoading,
    handleChange,
    handleSubmit,
  };
};

export default useAddBeneficiaryController;
