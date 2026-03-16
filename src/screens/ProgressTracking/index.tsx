import { View, StyleSheet } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import images from "../../assets/images"
import Button from "../../components/Button"
import CardWrapper from "../../components/CardWrapper"
import Image from "../../components/Image"
import Row from "../../components/Row"
import Text from "../../components/Text"
import Wrapper from "../../components/Wrapper"
import colors from "../../utils/colors"
import { heightPixel, widthPixel } from "../../utils/helper"
import { ROUTES } from "../../utils/routes"
import { RootStackParamList } from "../../interfaces"
import { StackNavigationProp } from "@react-navigation/stack"

type ProgressTrackingNavigationProp = StackNavigationProp<
    RootStackParamList,
    "ProgressTracking"
>

const ProgressTracking = () => {
    const navigation = useNavigation<ProgressTrackingNavigationProp>()
    const route = useRoute()

    const onViewAvatarDetail = () => {
        navigation.navigate(ROUTES.AVATAR_DETAIL as any, {
            // Forward any user id that may have been passed in
            id: (route.params as any)?.id,
        } as any)
    }

    return (
        <Wrapper scrollable bottom_bar>
            <Row gap={5}>
                <View style={{ flex: 1 }}>
                    <CardWrapper height={352} padding={10} color={colors.blackish_gray} >
                        <View style={{ flex: 0.9, padding: heightPixel(0) }}>
                            <Image source={images.avatar.fat} style={styles.avatar} resize="contain" />
                        </View>
                        <Row style={{ flex: 0.1 }} justify="space-between" align="center">
                            <Button
                                font_size={10}
                                style={styles.smallButton}
                                text="View"
                                onPress={onViewAvatarDetail}
                            />
                            <Button
                                font_size={10}
                                type="outlined"
                                style={styles.smallButton}
                                text="Edit"
                            />
                        </Row>
                    </CardWrapper>
                </View>
                <View style={{ flex: 1 }}>
                    <CardWrapper height={352} padding={10} color={colors.blackish_gray} >
                        <View style={{ flex: 0.9, padding: heightPixel(10) }}>
                            <Image source={images.avatar.slim} style={styles.avatar} resize="contain" />
                        </View>
                        <Row style={{ flex: 0.1 }} justify="space-between" align="center">
                            <Button
                                font_size={10}
                                style={styles.smallButton}
                                text="View"
                                onPress={onViewAvatarDetail}
                            />
                            <Button
                                font_size={10}
                                type="outlined"
                                style={styles.smallButton}
                                text="Edit"
                            />
                        </Row>
                    </CardWrapper>
                </View>
            </Row>
            <View style={{ marginTop: heightPixel(30), gap: heightPixel(15) }}>
                <Text weight="semibold" size={20}>20% Progress</Text>
                <Image
                    source={images.graph}
                    style={{ width: "100%", height: heightPixel(276), borderRadius: widthPixel(12) }}
                    resize="contain"
                />
            </View>
        </Wrapper>
    )
}

const styles = StyleSheet.create({
    avatar: {
        width: "100%",
        height: heightPixel(260),
    },
    smallButton: {
        height: heightPixel(25),
        width: "47%",
        minWidth: 0,
        paddingHorizontal: 0,
    },
})

export default ProgressTracking