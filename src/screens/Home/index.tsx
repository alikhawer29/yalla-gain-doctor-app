import { useNavigation } from "@react-navigation/native"
import { FlatList, RefreshControl, View } from "react-native"
import images from "../../assets/images"
import Button from "../../components/Button"
import ServiceLogCard from "../../components/Cards/ServiceLogCard"
import Empty from "../../components/Empty"
import Image from "../../components/Image"
import ProfileHeader from "../../components/ProfileHeader"
import Text from "../../components/Text"
import Wrapper from "../../components/Wrapper"
import colors from "../../utils/colors"
import { formatBookingLocalDate, getBookingChargesAmount, heightPixel } from "../../utils/helper"
import { NAVIGATORS, ROUTES } from "../../utils/routes"
import useServiceLogsController from "../ServiceLogs/useServiceLogsController"

const HOME_SERVICE_LOGS_LIMIT = 2

const Home = () => {
    const navigation = useNavigation()
    const {
        values: {
            data,
            isPullRefreshing,
        },
        functions: {
            onPullRefresh,
            onPressCard,
        }
    } = useServiceLogsController()

    const serviceLogs = (data ?? []).slice(0, HOME_SERVICE_LOGS_LIMIT)
    const hasMoreLogs = (data?.length ?? 0) > HOME_SERVICE_LOGS_LIMIT

    const handleViewAll = () => {
        ; (navigation as any).navigate(NAVIGATORS.BOOKING_STACK, { screen: ROUTES.SERVICE_LOGS })
    }

    const listHeader = (
        <View style={{ gap: heightPixel(10) }}>
            <ProfileHeader />
            <View style={{ gap: heightPixel(10), marginVertical: heightPixel(15) }}>
                <Image source={images.home} style={{ height: heightPixel(180), borderRadius: heightPixel(10) }} />
                <Text>Welcome to Yalla Gain. Manage your appointments, connect with patients, track consultations, and provide personalized health and fitness guidance. Stay organized, monitor your service activity, and help your patients achieve their wellness goals with confidence.</Text>
            </View>
            <Text weight="semibold" size={20}>Service Logs</Text>
        </View>
    )

    const listFooter = hasMoreLogs ? (
        <Button
            text="View All"
            type="outlined"
            onPress={handleViewAll}
            style={{ marginTop: heightPixel(10) }}
        />
    ) : null

    return (
        <Wrapper bottom_bar>
            <FlatList
                data={serviceLogs}
                renderItem={({ item }) => (
                    <ServiceLogCard
                        date={formatBookingLocalDate(item)}
                        bookingId={`#${item?.id}`}
                        amount={getBookingChargesAmount(item)}
                        status={item?.status}
                        onPress={() => onPressCard(item?.id)}
                    />
                )}
                ListHeaderComponent={listHeader}
                ListFooterComponent={listFooter}
                ListEmptyComponent={<Empty message="No Service Logs Found" />}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={{ height: heightPixel(10) }} />}
                keyExtractor={(item) => item?.id?.toString()}
                contentContainerStyle={{ gap: heightPixel(10), flexGrow: 1 }}
                refreshControl={
                    <RefreshControl
                        refreshing={isPullRefreshing}
                        onRefresh={onPullRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
            />
        </Wrapper>
    )
}

export default Home