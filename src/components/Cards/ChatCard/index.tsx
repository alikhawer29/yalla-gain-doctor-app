import { FC, memo } from "react";
import { View } from "react-native";
import images from "../../../assets/images";
import { IChatCard } from "../../../interfaces";
import colors from "../../../utils/colors";
import Badge from "../../Badge";
import CardWrapper from "../../CardWrapper";
import Icon from "../../Icon";
import Row from "../../Row";
import Text from "../../Text";
import styles from "./styles";

const ChatCard: FC<IChatCard> = ({
    id,
    name,
    image,
    user_role,
    unread,
    last_message,
    onPress
}) => {
    const isAdmin = user_role === 'admin';
    const badgeColor = isAdmin ? colors.primary : colors.grayish_black;
    const badgeTitle = isAdmin ? 'Admin' : 'User';

    return (
        <CardWrapper border_radius={5} padding={8} height={110} onPress={onPress}>
            <Row gap={12} style={styles.container}>
                <View style={styles.icon_container}>
                    <Icon source={{ uri: image }} size={38} rounded no_padding />
                </View>
                <View style={styles.content_container}>
                    <View>
                        <Row justify="space-between" align="center">
                            <Text weight="semibold">{name}</Text>
                            {unread > 0 && (
                                <View style={styles.unread_badge}>
                                    <Text size={10} weight="semibold">{unread}</Text>
                                </View>
                            )}
                        </Row>
                        <Text lines={2} line_height={19} color={colors.icon_gray}>
                            {last_message?.message || 'No messages yet'}
                        </Text>
                    </View>
                    <Row justify="space-between" align="center">
                        <Badge title={badgeTitle} color={badgeColor} style={styles.badge} />
                        {last_message?.time && (
                            <Row align="center" gap={6}>
                                <Icon source={images.clock} size={11} tint_color={colors.icon_gray} />
                                <Text lines={2} size={10} color={colors.icon_gray}>{last_message.time}</Text>
                            </Row>
                        )}
                    </Row>
                </View>
            </Row>
        </CardWrapper>
    )
}

export default memo(ChatCard)