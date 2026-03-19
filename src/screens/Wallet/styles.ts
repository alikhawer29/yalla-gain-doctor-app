import { StyleSheet } from "react-native";
import { heightPixel, widthPixel } from "../../utils/helper";
import colors from "../../utils/colors";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: widthPixel(20),
        alignItems: "center",
    },
    coinImage: {
        width: widthPixel(200),
        height: heightPixel(200),
        marginTop: heightPixel(40),
    },
    title: {
        marginTop: heightPixel(30),
    },
    subtitle: {
        marginTop: heightPixel(10),
    },
    converterText: {
        marginTop: heightPixel(50),
    },
    button: {
        marginTop: heightPixel(30),
        width: "100%",
    }
});

export default styles;
