import { StyleSheet } from "react-native";
import { heightPixel } from "../../utils/helper";
import colors from "../../utils/colors";

const styles = StyleSheet.create({
    icon_container: {
        justifyContent: "center",
        alignItems: "center"
    },
    item_container: {
        flexWrap: 'wrap',
        paddingVertical: heightPixel(30)
    },
    border_top_container: {
        borderTopWidth: heightPixel(1),
        borderColor: colors.light_gray
    },
    item_width: {
        width: "50%",
    },
    item_full_width: {
        width: "100%",
    },
    item: {
        marginBottom: heightPixel(20)
    },
    actions: {
        gap: heightPixel(12),
        marginBottom: heightPixel(20),
    },
    danger_button: {
        borderColor: colors.danger,
        backgroundColor: colors.light_transparent_danger,
    }
})

export default styles