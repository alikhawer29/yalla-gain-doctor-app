import React, { useState } from "react"
import { View } from "react-native"
import Wrapper from "../../components/Wrapper"
import Text from "../../components/Text"
import Dropdown from "../../components/Dropdown"
import Button from "../../components/Button"
import colors from "../../utils/colors"
import { heightPixel, widthPixel } from "../../utils/helper"

const ChooseLanguage = () => {
    const [language, setLanguage] = useState("en")

    return (
        <Wrapper>
            <View>
                <Text color={colors.white} size={15} weight="regular" style={{ marginTop: 20 }}>
                    Choose your preferred language to personalize your experience. All menus, notifications, and app content will be displayed in the selected language. You can change your language preference at any time from the settings.
                </Text>

                <View style={{ marginTop: 40 }}>
                    <Dropdown
                        label="Choose Language"
                        required
                        value={language}
                        options={[
                            { label: "English", value: "en" },
                            { label: "Arabic", value: "ar" }
                        ]}
                        onChangeText={(val: any) => setLanguage(val.value)}
                    />
                </View>

                <Button text="Apply" style={{ marginTop: 40, width: "100%" }} />
            </View>
        </Wrapper>
    )
}

export default ChooseLanguage
