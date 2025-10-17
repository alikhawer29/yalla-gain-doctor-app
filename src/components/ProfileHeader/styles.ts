import { StyleSheet } from "react-native";
import { heightPixel, widthPixel } from "../../utils/helper";

const styles = StyleSheet.create({
    container: {
        minHeight: heightPixel(50),
        width: "100%",
    },
    content_container: {
        flex: 1,
        height: "100%",
    },
    image_container: {
        width: "15%",
    },
    text_container: {
        width: "85%",
        paddingHorizontal: widthPixel(10)
    }
})

export default styles