import React from "react"
import { View } from "react-native"
import Wrapper from "../../components/Wrapper"
import Text from "../../components/Text"
import colors from "../../utils/colors"
import { heightPixel, widthPixel } from "../../utils/helper"

const FAQ = () => {
    return (
        <Wrapper>
            <View style={{ paddingHorizontal: widthPixel(20), flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text color={colors.white} size={24} weight="bold">FAQ's Coming Soon</Text>
            </View>
        </Wrapper>
    )
}

export default FAQ
