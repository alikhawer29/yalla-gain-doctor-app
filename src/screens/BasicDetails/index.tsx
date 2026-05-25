import React from "react"
import { View } from "react-native"
import Wrapper from "../../components/Wrapper"
import Text from "../../components/Text"
import Image from "../../components/Image"
import images from "../../assets/images"
import colors from "../../utils/colors"
import { heightPixel, widthPixel } from "../../utils/helper"

const BasicDetails = () => {

    const BASIC_DETAILS = `Our application is designed to offer a smooth, modern, and intuitive experience for every user. From powerful features to a clean interface, everything is built with simplicity and convenience in mind. We focus on performance, accessibility, and continuous improvement to ensure the best possible experience across all devices. Your satisfaction remains our top priority as we continue enhancing the platform with new updates and features. Your satisfaction remains our top priority as we continue enhancing the platform with new updates and features. Your satisfaction remains our top priority as we continue enhancing the platform with new updates and features.`
    return (
        <Wrapper scrollable>
            <View style={{ paddingBottom: heightPixel(30) }}>
                <Text color={colors.white} size={15} weight="regular" style={{ marginTop: 20 }}>
                    {BASIC_DETAILS}
                </Text>

                <Image
                    source={images.onboarding}
                    style={{ width: "100%", height: heightPixel(250), borderRadius: 20, marginTop: 30 }}
                    resize="cover"
                />
            </View>
        </Wrapper>
    )
}

export default BasicDetails
