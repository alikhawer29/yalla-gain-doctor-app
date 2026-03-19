import { StyleSheet } from "react-native";
import { heightPixel, widthPixel } from "../../utils/helper";
import colors from "../../utils/colors";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: widthPixel(20),
        paddingBottom: heightPixel(30),
    },
    text: {
        marginTop: heightPixel(20),
        lineHeight: 24,
    },
    footerContainer: {
        marginTop: heightPixel(40),
        alignItems: "center",
    },
    separator: {
        height: 1,
        backgroundColor: colors.white,
        flex: 1,
    },
    socialRow: {
        flexDirection: "row",
        justifyContent: "center",
        gap: widthPixel(20),
        marginTop: heightPixel(20),
    }
});

export default styles;
