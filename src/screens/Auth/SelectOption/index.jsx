import { ImageBackground } from "react-native"
import images from "../../../assets/images"
import Button from "../../../components/Button"
import Text from "../../../components/Text"
import Wrapper from "../../../components/Wrapper"
import colors from "../../../utils/colors"
import { heightPixel } from "../../../utils/helper"
import { navigate, navigateAndSimpleReset } from "../../../utils/navigation"
import { ROUTES } from "../../../utils/routes"

const SelectOption = () => {
    return (
        <Wrapper>
            <ImageBackground source={images.doctor} style={{ height: heightPixel(260), padding: heightPixel(10), justifyContent: "flex-end", marginTop: heightPixel(30) }} imageStyle={{ borderRadius: heightPixel(10) }}>
                <Button text="Register as Doctor" onPress={() => navigate(ROUTES.REGISTER, { type: "doctor" })} />
            </ImageBackground>
            <ImageBackground source={images.trainer} style={{ height: heightPixel(260), padding: heightPixel(10), justifyContent: "flex-end", marginTop: heightPixel(30) }} imageStyle={{ borderRadius: heightPixel(10) }}>
                <Button text="Register as Trainer" onPress={() => navigate(ROUTES.REGISTER, { type: "trainer" })} />
            </ImageBackground>
            <Text position="center" size={16} weight="semibold" style={{ marginVertical: heightPixel(80) }}>
                {"Already a User? "}
                <Text underline color={colors.primary} size={16} weight="semibold" onPress={() => navigateAndSimpleReset(ROUTES.USER_ENTRY)}>
                    {"Login"}
                </Text>
                {" Now"}
            </Text>
        </Wrapper>
    )
}

export default SelectOption