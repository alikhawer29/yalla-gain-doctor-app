import React from 'react';
import { View } from 'react-native';
import Wrapper from '../../components/Wrapper';
import KeyboardAvoidingWrapper from '../../components/KeyboardAvoidingWrapper';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Seperator from '../../components/Seperator';
import Text from '../../components/Text';
import colors from '../../utils/colors';
import styles from './styles';
import useAddBeneficiaryController from './useAddBeneficiaryController';

const AddBeneficiary = () => {
  const { form, errors, isLoading, handleChange, handleSubmit } =
    useAddBeneficiaryController();

  return (
    <Wrapper bottom_bar={false}>
      <KeyboardAvoidingWrapper>
        <View style={styles.container}>
          <Text color={colors.icon_gray} size={13} style={{ marginBottom: 8 }}>
            All payouts are in AED. IBAN must be a valid UAE account.
          </Text>
          <Seperator size={8} />

          <Input
            label="Account holder name"
            placeholder="Full name as on bank account"
            required
            value={form.account_holder_name}
            onChangeText={v => handleChange('account_holder_name', v)}
            error={errors.account_holder_name}
          />
          <Input
            label="IBAN"
            placeholder="AE07..."
            required
            value={form.iban}
            onChangeText={v => handleChange('iban', v)}
            error={errors.iban}
          />
          <Input
            label="Address line 1"
            placeholder="Street, building"
            required
            value={form.line1}
            onChangeText={v => handleChange('line1', v)}
            error={errors.line1}
          />
          <Input
            label="Tax ID"
            placeholder="Tax registration / TRN"
            required
            value={form.tax_id}
            onChangeText={v => handleChange('tax_id', v)}
            error={errors.tax_id}
          />
          <Input
            label="State / Emirate"
            placeholder="e.g. Dubai"
            required
            value={form.state}
            onChangeText={v => handleChange('state', v)}
            error={errors.state}
          />

          <Button
            text="Save beneficiary"
            loading={isLoading}
            onPress={handleSubmit}
            style={styles.button}
          />
        </View>
      </KeyboardAvoidingWrapper>
    </Wrapper>
  );
};

export default AddBeneficiary;
