import React from 'react';
import { View } from 'react-native';
import Wrapper from '../../components/Wrapper';
import KeyboardAvoidingWrapper from '../../components/KeyboardAvoidingWrapper';
import Text from '../../components/Text';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Seperator from '../../components/Seperator';
import colors from '../../utils/colors';
import styles from './styles';
import useWithdrawBeneficiaryController from './useWithdrawBeneficiaryController';

const WithdrawBeneficiary = () => {
  const {
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
  } = useWithdrawBeneficiaryController();

  if (!beneficiary) {
    return (
      <Wrapper bottom_bar={false}>
        <View style={styles.container}>
          <Text color={colors.danger} size={14}>
            Missing beneficiary. Go back and select a beneficiary.
          </Text>
        </View>
      </Wrapper>
    );
  }

  return (
    <Wrapper bottom_bar={false}>
      <KeyboardAvoidingWrapper>
        <View style={styles.container}>
          <View style={styles.summary}>
            <Text color={colors.white} weight="bold" size={16}>
              {beneficiary.account_holder_name || '—'}
            </Text>
            <Text color={colors.icon_gray} size={13} style={{ marginTop: 6 }}>
              {maskIban(beneficiary.iban, beneficiary.iban_last4)} ·{' '}
              {beneficiary.currency || 'AED'}
            </Text>
          </View>

          <Text color={colors.white} size={14}>
            Available balance:{' '}
            <Text weight="bold">
              {availableAed.toFixed(2)} {balanceCurrency}
            </Text>
          </Text>
          <Text color={colors.icon_gray} size={12} style={{ marginTop: 4 }}>
            Coins: {myCoins} · 1 coin = {coinAmount} {balanceCurrency}
          </Text>

          <Seperator size={20} />

          <Input
            label={`Withdrawal amount (${balanceCurrency})`}
            placeholder="0.00"
            required
            type="number"
            value={amount}
            onChangeText={onChangeAmount}
            error={amountError}
          />

          <Button
            text="Submit withdrawal"
            loading={isLoading}
            onPress={handleSubmit}
            style={styles.button}
          />
        </View>
      </KeyboardAvoidingWrapper>
    </Wrapper>
  );
};

export default WithdrawBeneficiary;
