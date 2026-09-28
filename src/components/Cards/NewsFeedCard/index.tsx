import { FC, memo, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import images from "../../../assets/images";
import { INewsFeedCard } from "../../../interfaces";
import colors from "../../../utils/colors";
import { heightPixel } from "../../../utils/helper";
import CardWrapper from "../../CardWrapper";
import Icon from "../../Icon";
import Image from "../../Image";
import Menu from "../../Menu";
import PostCommentsModal from "../../PostCommentsModal";
import Row from "../../Row";
import Text from "../../Text";

const NewsFeedCard: FC<INewsFeedCard> = ({ id, content, media, reaction_count = 0, comment_count = 0, user }) => {
    const [showCommentsModal, setShowCommentsModal] = useState(false);
    const [localCommentCount, setLocalCommentCount] = useState(comment_count);

    return (
        <CardWrapper padding={18} height={"auto"} color={colors.blackish_gray}>
            <Row align="center" gap={12}>
                <Row style={{ flex: 0.9 }} align="center" gap={12}>
                    <Icon source={images.dummy} size={45} />
                    <View>
                        <Text weight="semibold">{user?.first_name} {user?.last_name}</Text>
                        <Text size={12} color={colors.icon_gray}>2 days ago</Text>
                    </View>
                </Row>
                <Menu dropdown_items={[{ label: "Report" }]} style={{ flex: 0.1, alignItems: "flex-end" }} />
            </Row>
            <View style={{ marginVertical: heightPixel(15), gap: heightPixel(15) }}>
                {content && <Text>{content}</Text>}
                {
                    media &&
                    <View style={{ height: heightPixel(180), borderRadius: heightPixel(10), overflow: "hidden" }}>
                        <Image source={media} resize="cover" />
                    </View>
                }
            </View>
            <Row justify="space-between">
                <Row align="center" gap={4}>
                    <Icon source={images.heart} size={15} />
                    <Text size={12}>{reaction_count}</Text>
                </Row>
                <TouchableOpacity onPress={() => id != null && setShowCommentsModal(true)}>
                    <Row align="center" gap={4}>
                        <Icon source={images.comment} size={15} />
                        <Text size={12}>{localCommentCount}</Text>
                    </Row>
                </TouchableOpacity>
            </Row>
            <Row justify="space-between" style={{ borderTopWidth: 1, borderColor: colors.dark_gray, paddingTop: heightPixel(5), marginTop: heightPixel(5) }}>
                <Row align="center" gap={4}>
                    <Icon source={images.like} size={15} />
                    <Text size={11}>Like</Text>
                </Row>
                <TouchableOpacity onPress={() => id != null && setShowCommentsModal(true)}>
                    <Row align="center" gap={4}>
                        <Icon source={images.comment} size={15} />
                        <Text size={11}>Comment</Text>
                    </Row>
                </TouchableOpacity>
            </Row>
            {id != null ? (
                <PostCommentsModal
                    visible={showCommentsModal}
                    onClose={() => setShowCommentsModal(false)}
                    post_id={id}
                    comment_count={localCommentCount}
                    onCommentAdded={() => setLocalCommentCount(prev => prev + 1)}
                    onCommentDeleted={() => setLocalCommentCount(prev => Math.max(0, prev - 1))}
                />
            ) : null}
        </CardWrapper>
    )
}

export default memo(NewsFeedCard)