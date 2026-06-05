import { StyleSheet } from "react-native"
import { heightPixel, widthPixel } from "../../../utils/helper"
import colors from "../../../utils/colors"

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.blackish_gray,
        borderRadius: heightPixel(10),
        padding: widthPixel(15),
        borderWidth: 1,
        borderColor: colors.gray,
    },
    content: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    leftContent: {
        flex: 1,
        gap: heightPixel(5),
    },
    rightContent: {
        alignItems: "flex-end",
    },
    dateRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: widthPixel(5),
    },
    amountRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: widthPixel(5),
    },
    statusBadge: {
        paddingHorizontal: widthPixel(12),
        paddingVertical: heightPixel(4),
        borderRadius: heightPixel(15),
        alignItems: "center",
        justifyContent: "center",
    },
})

export default styles
