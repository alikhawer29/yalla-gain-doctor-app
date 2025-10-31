import { StyleSheet } from "react-native"
import { heightPixel } from "../../utils/helper"
import colors from "../../utils/colors"

const styles = StyleSheet.create({
    image: {
        height: heightPixel(189),
        borderRadius: heightPixel(10),
        marginBottom: heightPixel(15)
    },
    half_width_box: {
        width: "50%",
    },
    full_width_box: {
        width: "100%",
    },
    section_title: {
        marginBottom: heightPixel(20),
        marginTop: heightPixel(10),
    },
    label_text: {
        fontWeight: "600",
    },
    value_text: {
        color: colors.icon_gray,
    },
})

export default styles