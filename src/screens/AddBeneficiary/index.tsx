import React from 'react';
import { View } from 'react-native';
import Wrapper from '../../components/Wrapper';
import KeyboardAvoidingWrapper from '../../components/KeyboardAvoidingWrapper';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Seperator from '../../components/Seperator';
import Text from '../../components/Text';
import colors from '../../utils/colors';
import styles from './styles';
import useAddBeneficiaryController from './useAddBeneficiaryController';

const AddBeneficiary = () => {
  const {
    hasConnectAccount,
    isLoading,
    openedStripe,
    handleContinueWithStripe,
    handleCancel,
    form,
    handleSubmitBeneficiary,
  } = useAddBeneficiaryController();

  if (hasConnectAccount) {
    return (
      <Wrapper bottom_bar={false}>
        <KeyboardAvoidingWrapper>
          <View style={styles.container}>
            <Text color={colors.white} weight="bold" size={18}>
              Add another beneficiary
            </Text>
            <Seperator size={10} />
            <Text color={colors.icon_gray} size={14} style={styles.copy}>
              Your Stripe account is already set up. Add a new UAE bank account
              (IBAN) here, then withdraw to any beneficiary from the list.
            </Text>
            <Seperator size={16} />

            <Input
              label="IBAN"
              placeholder="AE070331234567890123456"
              value={form.iban}
              onChangeText={form.setIban}
              error={form.errors.iban}
              required
            />
            <Seperator size={12} />
            <Input
              label="Account holder name"
              placeholder="Name on the bank account"
              value={form.accountHolderName}
              onChangeText={form.setAccountHolderName}
              error={form.errors.account_holder_name}
              required
            />
            <Seperator size={12} />
            <Input
              label="Trade licence / Tax ID"
              placeholder="Trade licence number"
              value={form.taxId}
              onChangeText={form.setTaxId}
              error={form.errors.tax_id}
              required
            />
            <Seperator size={12} />
            <Input
              label="Address"
              placeholder="Street address"
              value={form.line1}
              onChangeText={form.setLine1}
              error={form.errors.line1}
              required
            />
            <Seperator size={12} />
            <Input
              label="Emirate / State"
              placeholder="Dubai"
              value={form.state}
              onChangeText={form.setState}
              error={form.errors.state}
              required
            />

            <Button
              text="Save beneficiary"
              loading={isLoading}
              onPress={handleSubmitBeneficiary}
              style={styles.button}
            />
            <Button
              text="Cancel"
              type="outlined"
              onPress={handleCancel}
              style={styles.cancelButton}
            />
          </View>
        </KeyboardAvoidingWrapper>
      </Wrapper>
    );
  }

  return (
    <Wrapper bottom_bar={false}>
      <View style={styles.container}>
        <Text color={colors.white} weight="bold" size={18}>
          Add payout beneficiary
        </Text>
        <Seperator size={10} />
        <Text color={colors.icon_gray} size={14} style={styles.copy}>
          First-time setup uses Stripe’s secure form for bank and identity
          details. After that, you can add more bank accounts inside the app.
        </Text>
        <Seperator size={8} />
        <Text color={colors.icon_gray} size={13} style={styles.copy}>
          Payouts are in AED. Use a valid UAE bank account (IBAN).
        </Text>

        <Button
          text={openedStripe ? 'Waiting for Stripe…' : 'Continue with Stripe'}
          loading={isLoading}
          onPress={handleContinueWithStripe}
          style={styles.button}
        />
        <Button
          text="Cancel"
          type="outlined"
          onPress={handleCancel}
          style={styles.cancelButton}
        />
      </View>
    </Wrapper>
  );
};

export default AddBeneficiary;
