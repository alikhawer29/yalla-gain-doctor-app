import { FC, memo } from "react"
import { View } from "react-native"
import LoaderKitView from "react-native-loader-kit"
import { ILoader } from "../../interfaces"
import colors from "../../utils/colors"
import { heightPixel } from "../../utils/helper"
import styles from "./styles"

const Loader: FC<ILoader> = ({ color = colors.white, type = "BallPulse", mode = "primary" }) => {

    if (mode === "secondary") {
        return (
            <View style={{ alignSelf: "center", height: heightPixel(100), padding: 20, backgroundColor: colors.transparent, width: heightPixel(100), borderRadius: heightPixel(10), justifyContent: "center", alignItems: "center", }}>
                <LoaderKitView
                    style={styles.loader}
                    name={"BallSpinFadeLoader"}
                    animationSpeedMultiplier={1.0}
                    color={colors.primary}
                />
            </View>
        )
    }


    return (
        <LoaderKitView
            style={styles.loader}
            name={type}
            animationSpeedMultiplier={1.0}
            color={color}
        />
    )
}

export default memo(Loader)