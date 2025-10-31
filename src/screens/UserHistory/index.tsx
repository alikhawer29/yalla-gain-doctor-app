import { FlatList, RefreshControl, View } from "react-native"
import Row from "../../components/Row"
import Text from "../../components/Text"
import Wrapper from "../../components/Wrapper"
import colors from "../../utils/colors"
import { heightPixel } from "../../utils/helper"
import useUserHistoryController from "./useUserHistoryController"
import styles from "./styles"
import globalStyles from "../../utils/styles"
import ServiceCard from "../../components/Cards/ServiceCard"
import Empty from "../../components/Empty"
import Seperator from "../../components/Seperator"
import Loader from "../../components/Loader"
import Input from "../../components/Input"
import Icon from "../../components/Icon"
import images from "../../assets/images"

const UserHistory = () => {

    const {
        values: {
            data,
            isLoading,
            search
        },
        functions: {
            onReload,
            onPressCard,
            onSearch
        }
    } = useUserHistoryController()

    if (isLoading) {
        return <Loader mode="secondary" />
    }

    return (
        <Wrapper>
            <View style={{ gap: heightPixel(15) }}>
                <Row>
                    <View style={styles.half_width_box}>
                        <Text weight="semibold">User Name:</Text>
                        <Text style={styles.value_text} color={colors.icon_gray}>{data?.username}</Text>
                    </View>
                    <View style={styles.half_width_box}>
                        <Text weight="semibold">Total Booking:</Text>
                        <Text style={styles.value_text} color={colors.icon_gray}>{data?.total_bookings}</Text>
                    </View>
                </Row>
                <Row>
                    <View style={styles.half_width_box}>
                        <Text weight="semibold">Upcoming Appointment:</Text>
                        <Text style={styles.value_text} color={colors.icon_gray}>{data?.upcoming_appointments}</Text>
                    </View>
                    <View style={styles.half_width_box}>
                        <Text weight="semibold">Last Month's Visits:</Text>
                        <Text style={styles.value_text} color={colors.icon_gray}>{data?.last_month_appointments}</Text>
                    </View>
                </Row>
                <Row align="center" gap={10}>
                    <View style={{ width: "85%" }}>
                        <Input
                            placeholder="Search Booking"
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
                <FlatList
                    data={data?.bookings}
                    keyExtractor={item => item?.id?.toString()}
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={() => <Seperator />}
                    refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onReload} />}
                    contentContainerStyle={globalStyles.bottom_scrollable_space_with_bottombar}
                    ListEmptyComponent={() => <Empty message="No Request Found" />}
                    style={{ marginTop: heightPixel(15) }}
                    renderItem={({ item }) => <ServiceCard data={item} onPress={() => onPressCard(item?.id)} />}
                />
            </View>
        </Wrapper>
    )
}

export default UserHistory