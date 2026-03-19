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
    const LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar sic tempor. Sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nam fermentum, nulla luctus pharetra vulputate, felis tellus mollis orci, sed rhoncus pronin sapien nunc accuan eget. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo."

    return (
        <Wrapper scrollable>
            <View style={styles.container}>
                <Text color={colors.white} style={styles.text} size={15}>
                    {LOREM}
                </Text>

                <Text color={colors.white} style={styles.text} size={15}>
                    {LOREM}
                </Text>

                <Text color={colors.white} style={styles.text} size={15}>
                    {LOREM}
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
