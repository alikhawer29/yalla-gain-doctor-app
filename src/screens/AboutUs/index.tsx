import React from "react"
import { View } from "react-native"
import Wrapper from "../../components/Wrapper"
import Text from "../../components/Text"
import Row from "../../components/Row"
import Icon from "../../components/Icon"
import images from "../../assets/images"
import styles from "./styles"
import colors from "../../utils/colors"

const AboutUs = () => {
    const ABOUT_US = `Welcome to our platform, where innovation meets simplicity. Our mission is to provide a seamless and user-friendly experience that helps users stay connected, productive, and empowered every day. We are committed to delivering high-quality services with reliability, security, and performance at the core of everything we build. Our team continuously works to improve features and create solutions that truly make a difference. Thank you for being part of our journey. Your trust and support inspire us to keep growing and delivering the best possible experience for our community.`
    return (
        <Wrapper scrollable>
            <View style={styles.container}>
                <Text color={colors.white} style={styles.text} size={15}>
                    {ABOUT_US}
                </Text>

                <Text color={colors.white} style={styles.text} size={15}>
                    {ABOUT_US}
                </Text>

                <View style={styles.footerContainer}>
                    <Row align="center" gap={10} style={{ width: "100%" }}>
                        <View style={styles.separator} />
                        <Text color={colors.white} weight="semibold">Follow Us Here</Text>
                        <View style={styles.separator} />
                    </Row>

                    <View style={styles.socialRow}>
                        <Icon source={images.facebook} size={50} rounded border={colors.white} />
                        <Icon source={images.apple} size={50} rounded border={colors.white} />
                        <Icon source={images.google} size={50} rounded border={colors.white} />
                        <Icon source={images.facebook} size={50} rounded border={colors.white} />
                    </View>
                </View>
            </View>
        </Wrapper>
    )
}

export default AboutUs
