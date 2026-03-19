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
            <View style={{ paddingHorizontal: widthPixel(20) }}>
                <Text color={colors.white} size={15} weight="regular" style={{ marginTop: 20 }}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo.
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
