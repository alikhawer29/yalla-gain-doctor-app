import React from "react"
import { View } from "react-native"
import Wrapper from "../../components/Wrapper"
import Text from "../../components/Text"
import Image from "../../components/Image"
import images from "../../assets/images"
import colors from "../../utils/colors"
import { heightPixel, widthPixel } from "../../utils/helper"

const BasicDetails = () => {
    return (
        <Wrapper scrollable>
            <View style={{ paddingHorizontal: widthPixel(20), paddingBottom: heightPixel(30) }}>
                <Text color={colors.white} size={15} weight="regular" style={{ marginTop: 20 }}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar sic tempor.
                </Text>

                <Text color={colors.white} size={15} weight="regular" style={{ marginTop: 20 }}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar sic tempor.
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
