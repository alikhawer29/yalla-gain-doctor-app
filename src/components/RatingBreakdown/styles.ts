import { StyleSheet } from "react-native";
import { heightPixel } from "../../utils/helper";
import colors from "../../utils/colors";

const styles = StyleSheet.create({
    container: {
        gap: heightPixel(12),
        position: "relative",
    },
    label_wrapper: {
        flex: 0.15,
    },
    bar_wrapper: {
        justifyContent: "center",
    },
    bar_background: {
        height: 8,
        backgroundColor: colors.gray,
        borderRadius: heightPixel(2),
    },
    bar_fill: {
        height: "100%",
        backgroundColor: colors.yellow,
        borderRadius: heightPixel(2),
    },
    rating_summary: {
        position: "absolute",
        right: 0,
        bottom: 0,
    },
})

export default styles