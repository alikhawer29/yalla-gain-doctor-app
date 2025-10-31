import { FlatList, RefreshControl, View } from "react-native"
import { AirbnbRating, Rating } from "react-native-ratings"
import images from "../../assets/images"
import CardWrapper from "../../components/CardWrapper"
import Empty from "../../components/Empty"
import Icon from "../../components/Icon"
import Loader from "../../components/Loader"
import RatingBreakdown from "../../components/RatingBreakdown"
import Row from "../../components/Row"
import Seperator from "../../components/Seperator"
import Text from "../../components/Text"
import Wrapper from "../../components/Wrapper"
import colors from "../../utils/colors"
import { RATINGS } from "../../utils/data"
import { heightPixel, widthPixel } from "../../utils/helper"
import globalStyles from "../../utils/styles"
import useReviewController from "./useReviewController"

const Reviews = () => {

    const {
        values: {
            data,
            selected = "all",
            isLoading
        },
        functions: {
            onChangeStatus,
            onReload
        }
    } = useReviewController()

    if (isLoading) {
        return <Loader mode="secondary" />
    }

    return (
        <Wrapper>
            <View style={{ gap: heightPixel(15) }}>
                <RatingBreakdown data={data} />
                <View>
                    <FlatList
                        horizontal
                        data={RATINGS}
                        ItemSeparatorComponent={() => <Seperator horizontal />}
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <Row align="center" gap={5} onPress={() => onChangeStatus(item?.value)} style={{ borderRadius: heightPixel(4), borderWidth: 1, borderColor: item?.value === selected ? colors.primary : colors.dark_gray, backgroundColor: item?.value === selected ? colors.primary : colors.transparent, justifyContent: "center", alignItems: "center", paddingHorizontal: widthPixel(20), paddingVertical: heightPixel(5) }}>
                                {item?.value !== "all" && <Icon size={10} source={images.star} />}
                                <Text size={10} color={item?.value === selected ? colors.white : colors.dark_gray}>{item?.label}</Text>
                            </Row>
                        )}
                    />
                </View>
                <FlatList
                    data={data?.ratings}
                    keyExtractor={item => item?.id?.toString()}
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={() => <Seperator />}
                    refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onReload} />}
                    contentContainerStyle={globalStyles.bottom_scrollable_space_with_bottombar}
                    ListEmptyComponent={() => <Empty message="No Reviews Found" />}
                    style={{ marginTop: heightPixel(15) }}
                    renderItem={({ item }) => (
                        <CardWrapper border_radius={0} color={colors.transparent}>
                            <Row style={{ width: "100%" }}>
                                <View style={{ width: "15%" }}>
                                    <Icon size={37} rounded no_padding source={{ uri: item?.user?.photo }} />
                                </View>
                                <View style={{ width: "85%", gap: heightPixel(10) }}>
                                    <Row justify="space-between" align="center" >
                                        <View style={{ gap: heightPixel(5) }}>
                                            <Text weight="semibold">{item?.user?.first_name} {item?.user?.last_name}</Text>
                                            <Rating
                                                tintColor='#000'
                                                ratingBackgroundColor='#3498db'
                                                ratingCount={5}
                                                readonly
                                                startingValue={item?.rating}
                                                imageSize={12}
                                                style={{ justifyContent: "flex-start", alignItems: "flex-start" }}
                                            />
                                        </View>
                                        <View >
                                            <Text color={colors.icon_gray} size={12}>June 26, 2025</Text>
                                        </View>
                                    </Row>
                                    <Text color={colors.icon_gray} size={12}>{item?.review}</Text>
                                </View>
                            </Row>
                        </CardWrapper>
                    )}
                />
            </View>
        </Wrapper>
    )
}

export default Reviews