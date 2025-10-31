import { FlatList, RefreshControl, View } from "react-native"
import images from "../../assets/images"
import Button from "../../components/Button"
import CardWrapper from "../../components/CardWrapper"
import Empty from "../../components/Empty"
import Icon from "../../components/Icon"
import Row from "../../components/Row"
import Seperator from "../../components/Seperator"
import StatusBadge from "../../components/StatusBadge"
import Text from "../../components/Text"
import Touchable from "../../components/Touchable"
import Wrapper from "../../components/Wrapper"
import colors from "../../utils/colors"
import { STATUSES } from "../../utils/data"
import { heightPixel, widthPixel } from "../../utils/helper"
import globalStyles from "../../utils/styles"
import useServiceLogsController from "./useServiceLogsController"
import ServiceCard from "../../components/Cards/ServiceCard"
import Input from "../../components/Input"

const ServiceLogs = () => {

    const {
        values: {
            data,
            isLoading,
            selected,
            search
        },
        functions: {
            onReload,
            onPressCard,
            onRequests,
            onChangeStatus,
            onSearch
        }
    } = useServiceLogsController()

    return (
        <Wrapper>
            <View style={{ gap: heightPixel(10) }}>
                <Button type="outlined" text="Appointment Requests" onPress={onRequests} />
                <Row align="center" gap={10}>
                    <View style={{ width: "85%" }}>
                        <Input
                            placeholder="Search Appointment"
                            height={40}
                            icon={images.search}
                            value={search}
                            onChangeText={onSearch}
                        />
                    </View>
                    <View style={{ width: "15%" }}>
                        <Icon source={images.filters} size={40} rounded less_rounded border={colors.white} />
                    </View>
                </Row>
                <View>
                    <FlatList
                        horizontal
                        data={STATUSES}
                        ItemSeparatorComponent={() => <Seperator horizontal />}
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <Touchable onPress={() => onChangeStatus(item?.value)} style={{ borderRadius: heightPixel(4), borderWidth: 1, borderColor: item?.value === selected ? colors.primary : colors.dark_gray, backgroundColor: item?.value === selected ? colors.primary : colors.transparent, justifyContent: "center", alignItems: "center", paddingHorizontal: widthPixel(20), paddingVertical: heightPixel(5) }}>
                                <Text size={10} color={item?.value === selected ? colors.white : colors.dark_gray}>{item?.label}</Text>
                            </Touchable>
                        )}
                    />
                </View>
            </View>
            <FlatList
                data={data}
                keyExtractor={item => item?.id?.toString()}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <Seperator />}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onReload} />}
                contentContainerStyle={globalStyles.bottom_scrollable_space}
                ListEmptyComponent={() => <Empty message="No Request Found" />}
                style={{ marginTop: heightPixel(15) }}
                renderItem={({ item }) => <ServiceCard data={item} onPress={() => onPressCard(item?.id)} />}
            />
        </Wrapper>
    )
}

export default ServiceLogs