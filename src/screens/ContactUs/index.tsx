import React from "react"
import { View } from "react-native"
import Wrapper from "../../components/Wrapper"
import Text from "../../components/Text"
import Input from "../../components/Input"
import Button from "../../components/Button"
import styles from "./styles"
import colors from "../../utils/colors"
import useContactUsController from "./useContactUsController"
import { heightPixel, widthPixel } from "../../utils/helper"

const ContactUs = () => {
    const { form, errors, isLoading, handleChange, handleSubmit } = useContactUsController()

    return (
        <Wrapper scrollable>
            <View>
                <Text position="center" size={16} weight="semibold" style={{ marginVertical: 20 }} color={colors.white}>
                    Please Let Us Know How We Can Improve Your Experience
                </Text>

                <Input
                    label="Full Name"
                    required
                    placeholder="Enter Full Name"
                    value={form.name}
                    onChangeText={(val: string) => handleChange("name", val)}
                    error={errors.name}
                />

                <Input
                    label="Email Address"
                    required
                    placeholder="Enter Your Email Address"
                    type="email"
                    value={form.email}
                    onChangeText={(val: string) => handleChange("email", val)}
                    error={errors.email}
                />

                <Input
                    label="Subject"
                    required
                    placeholder="Enter Subject"
                    value={form.subject}
                    onChangeText={(val: string) => handleChange("subject", val)}
                    error={errors.subject}
                />

                <Input
                    label="Message"
                    required
                    placeholder="Write Here"
                    type="textarea"
                    value={form.message}
                    onChangeText={(val: string) => handleChange("message", val)}
                    error={errors.message}
                />

                <Button
                    text="Submit"
                    loading={isLoading}
                    onPress={handleSubmit}
                    style={{ marginTop: 20, width: "100%" }}
                />
            </View>
        </Wrapper>
    )
}

export default ContactUs