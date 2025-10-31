import { BlurView } from "@react-native-community/blur"
import { memo } from "react"
import { StyleSheet, View } from "react-native"
import Loader from "../Loader"
import { heightPixel } from "../../utils/helper"
import colors from "../../utils/colors"

const ScreenLoader = () => {
    return (
        <View style={{ position: "absolute", top: 0, left: 0, bottom: 0, right: 0, zIndex: 99, justifyContent: "center", alignItems: "center" }}>
            <BlurView style={StyleSheet.absoluteFill} blurType='dark' blurRadius={2} />
            <View style={{ height: heightPixel(100), width: heightPixel(100), backgroundColor: colors.blackish_gray, borderRadius: heightPixel(10), justifyContent: "center", alignItems: "center" }}>
                <Loader />
            </View>
        </View>
    )
}

export default memo(ScreenLoader)