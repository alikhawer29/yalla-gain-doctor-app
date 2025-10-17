import { FlatList, RefreshControl, View } from "react-native"
import images from "../../assets/images"
import CardWrapper from "../../components/CardWrapper"
import Icon from "../../components/Icon"
import Image from "../../components/Image"
import Row from "../../components/Row"
import Seperator from "../../components/Seperator"
import Text from "../../components/Text"
import Wrapper from "../../components/Wrapper"
import colors from "../../utils/colors"
import { heightPixel } from "../../utils/helper"
import useMyServicesController from "./useMyServicesController"
import globalStyles from "../../utils/styles"

const MyServices = () => {

    const {
        values: {
            data,
            isLoading
        },
        functions: {
            onReload,
            onPressCard
        }
    } = useMyServicesController()

    return (
        <Wrapper>
            <FlatList
                data={data}
                keyExtractor={item => item.id.toString()}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <Seperator />}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onReload} />}
                contentContainerStyle={globalStyles.bottom_scrollable_space_with_bottombar}
                renderItem={({ item }) => (
                    <CardWrapper height={317} color={colors.blackish_gray} border_radius={10} onPress={() => onPressCard(item.id, item.title)}>
                        <View style={{ flex: 0.6 }}>
                            <Image source={{ uri: item?.image }} resize="cover" />
                        </View>
                        <View style={{ flex: 0.4, padding: heightPixel(15), justifyContent: "space-between" }}>
                            <Text size={20} weight="semibold">{item.title}</Text>
                            <Text lines={2}>{item.description}</Text>
                            <Row align="center" justify="space-between">
                                <Row align="center" gap={5}>
                                    <Text size={24} weight="semibold">{item?.charges || "0"}</Text>
                                    <Icon source={images.coin} size={15} />
                                    <Text size={12} weight="semibold">Yalla Coins</Text>
                                </Row>
                                <Row align="center" gap={5}>
                                    <Text weight="semibold">Category: </Text>
                                    <Text size={12}>{item?.service_category?.title}</Text>
                                </Row>
                            </Row>
                        </View>
                    </CardWrapper>
                )}
            />
        </Wrapper>
    )
}

export default MyServices