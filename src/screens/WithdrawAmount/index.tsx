import React from "react"
import { View } from "react-native"
import Wrapper from "../../components/Wrapper"
import KeyboardAvoidingWrapper from "../../components/KeyboardAvoidingWrapper"
import Text from "../../components/Text"
import Input from "../../components/Input"
import Button from "../../components/Button"
import Seperator from "../../components/Seperator"
import styles from "./styles"
import colors from "../../utils/colors"
import useWithdrawAmountController from "./useWithdrawAmountController"

const WithdrawAmount = () => {
    const { form, errors, isLoading, walletData, handleChange, handleSubmit } = useWithdrawAmountController()

    return (
        <Wrapper bottom_bar={false}>
            <KeyboardAvoidingWrapper>
                <View style={styles.container}>
                    <Text size={16} weight="semibold" color={colors.white} position="center">
                        1 Yalla Coin Is Equal To {walletData?.coin_amount || "1"}$
                    </Text>
                    
                    <Seperator size={20} />

                    <Input
                        label="Fund Amount"
                        placeholder="Enter Fund Amount"
                        required
                        value={form.fund_amount}
                        onChangeText={(val: string) => handleChange("fund_amount", val)}
                        error={errors.fund_amount}
                        type="number"
                    />

                    <Input
                        label="Account holder Name"
                        placeholder="Enter Account Holder Name"
                        required
                        value={form.account_holder_name}
                        onChangeText={(val: string) => handleChange("account_holder_name", val)}
                        error={errors.account_holder_name}
                    />

                    <Input
                        label="Routing Number"
                        placeholder="Enter Routing Number"
                        required
                        value={form.routing_number}
                        onChangeText={(val: string) => handleChange("routing_number", val)}
                        error={errors.routing_number}
                        type="number"
                    />

                    <Input
                        label="Confirm Routing Number"
                        placeholder="Confirm Routing Number"
                        required
                        value={form.confirm_routing_number}
                        onChangeText={(val: string) => handleChange("confirm_routing_number", val)}
                        error={errors.confirm_routing_number}
                        type="number"
                    />

                    <Input
                        label="Account Number"
                        placeholder="Account Number"
                        required
                        value={form.account_number}
                        onChangeText={(val: string) => handleChange("account_number", val)}
                        error={errors.account_number}
                        type="number"
                    />

                    <Input
                        label="Confirm Account Number"
                        placeholder="Confirm Account Number"
                        required
                        value={form.confirm_account_number}
                        onChangeText={(val: string) => handleChange("confirm_account_number", val)}
                        error={errors.confirm_account_number}
                        type="number"
                    />

                    <Text size={18} weight="bold" color={colors.white} style={{ marginVertical: 10 }}>Personal Details</Text>

                    <Input
                        label="Address Line 1"
                        placeholder="123 Main St"
                        required
                        value={form.address_line1}
                        onChangeText={(val: string) => handleChange("address_line1", val)}
                        error={errors.address_line1}
                    />

                    <Input
                        label="City"
                        placeholder="Miami"
                        required
                        value={form.city}
                        onChangeText={(val: string) => handleChange("city", val)}
                        error={errors.city}
                    />

                    <Input
                        label="State"
                        placeholder="Florida"
                        required
                        value={form.state}
                        onChangeText={(val: string) => handleChange("state", val)}
                        error={errors.state}
                    />

                    <Input
                        label="Postal Code"
                        placeholder="12345"
                        required
                        value={form.postal_code}
                        onChangeText={(val: string) => handleChange("postal_code", val)}
                        error={errors.postal_code}
                    />

                    <Input
                        label="Date of Birth"
                        placeholder="1990-01-01"
                        required
                        type="date"
                        value={form.dob}
                        onChangeText={(val: string) => handleChange("dob", val)}
                        error={errors.dob}
                    />

                    <Input
                        label="Phone"
                        placeholder="+12025550123"
                        required
                        type="phone"
                        country="US"
                        value={form.phone}
                        onChangeText={(val: string) => handleChange("phone", val)}
                        error={errors.phone}
                    />

                    <Input
                        label="SSN Last 4"
                        placeholder="1234"
                        required
                        value={form.ssn_last_4}
                        onChangeText={(val: string) => handleChange("ssn_last_4", val)}
                        error={errors.ssn_last_4}
                        maxLength={4}
                        type="number"
                    />

                    <Button
                        text="Transfer Amount"
                        loading={isLoading}
                        onPress={handleSubmit}
                        style={styles.button}
                    />
                </View>
            </KeyboardAvoidingWrapper>
        </Wrapper>
    )
}

export default WithdrawAmount
