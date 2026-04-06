import { useEffect, useState } from "react"
import { Image, ImageBackground, StatusBar, View } from "react-native"
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import images from "../../assets/images"
import Text from "../../components/Text"
import Wrapper from "../../components/Wrapper"
import { heightPixel, widthPixel } from "../../utils/helper"
import { navigateAndSimpleReset } from "../../utils/navigation"
import { ROUTES } from "../../utils/routes"
import colors from "../../utils/colors"

const initialHeight = heightPixel(173.85);
const midHeight = heightPixel(142.37);
const finalHeight = heightPixel(161);

const AnimatedImage = Animated.createAnimatedComponent(Image);

const Onboarding = () => {

    const [initialView, setInitialView] = useState(true);
    const [finished, setFinished] = useState(false);

    const height = useSharedValue(initialHeight);
    const loadingProgress = useSharedValue(0);

    useEffect(() => {
        if (!initialView) {
            loadingProgress.value = withTiming(1, { duration: 2500 });
        }
    }, [initialView])

    useEffect(() => {
        if (finished) {
            let timeout = setTimeout(() => {
                navigateAndSimpleReset(ROUTES.USER_ENTRY);
            }, 3000);

            return () => clearTimeout(timeout)
        }
    }, [finished])

    useEffect(() => {

        let timeout = setTimeout(() => {
            height.value = withTiming(midHeight, { duration: 600 }, (finished) => {
                if (finished) {
                    runOnJS(setInitialView)(false);
                    height.value = withTiming(finalHeight, { duration: 300 }, (secondFinished) => {
                        if (secondFinished) {
                            runOnJS(setFinished)(true);
                        }
                    });
                }
            });
        }, 1000)

        return () => clearTimeout(timeout)

    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        height: height.value,
    }));

    const progressBarStyle = useAnimatedStyle(() => ({
        width: `${loadingProgress.value * 100}%`,
    }));

    let Component = initialView ? ImageBackground : Wrapper

    return (
        <View style={{ flex: 1, backgroundColor: colors.black }}>
            <Component source={images.splash} style={{ flex: 1, paddingTop: StatusBar.currentHeight }} >
                <AnimatedImage source={images.logo} style={[animatedStyle, { width: "100%", resizeMode: "contain", position: "absolute", top: heightPixel(80) }]} />
                {
                    !initialView &&
                    <View style={{ flex: 1, paddingHorizontal: widthPixel(40) }}>
                        <View style={{ flex: 0.65, justifyContent: "flex-end" }}>
                            <Image source={images.onboarding} style={{ width: "100%", height: "70%", resizeMode: "contain" }} />
                        </View>
                        <View style={{ flex: 0.35, justifyContent: 'space-between', paddingBottom: heightPixel(40) }}>
                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                <Text weight="bold" style={{ textAlign: 'center' }} size={32} line_height={40}>Your Fitness, Your Avatar, Your AI Coach!</Text>
                            </View>

                            <View style={{ alignItems: 'center' }}>
                                <Text size={16} style={{ marginBottom: heightPixel(8) }}>Loading</Text>
                                <View style={{
                                    width: '100%',
                                    height: heightPixel(18),
                                    borderWidth: 1.5,
                                    borderColor: colors.white,
                                    padding: 2,
                                    justifyContent: 'center'
                                }}>
                                    <Animated.View style={[
                                        {
                                            height: '100%',
                                            backgroundColor: colors.white,
                                        },
                                        progressBarStyle
                                    ]} />
                                </View>
                            </View>
                        </View>
                    </View>
                }
            </Component>
        </View>
    )
}


export default Onboarding