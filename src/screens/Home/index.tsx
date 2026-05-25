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
import { formatLongDate, heightPixel } from "../../utils/helper"
import { NAVIGATORS, ROUTES } from "../../utils/routes"
import useServiceLogsController from "../ServiceLogs/useServiceLogsController"

const Home = () => {
    const navigation = useNavigation()

    // const data = {
    //     labels: ["Mon", "Tues", "Wed", "Thu", "Fri"],
    //     datasets: [
    //         {
    //             data: [50, 95, 20, 50, 20],
    //             color: (opacity = 1) => colors.primary, // optional
    //             strokeWidth: 0 // optional
    //         }
    //     ],
    // };

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

    const handleViewAll = () => {
        ; (navigation as any).navigate(NAVIGATORS.BOOKING_STACK, { screen: ROUTES.SERVICE_LOGS })
    }

    const listHeader = (
        <View style={{ gap: heightPixel(10) }}>
            <ProfileHeader />
            <View style={{ gap: heightPixel(10), marginVertical: heightPixel(15) }}>
                <Image source={images.home} style={{ height: heightPixel(180), borderRadius: heightPixel(10) }} />
                <Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar sic tempor. Sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus</Text>
            </View>
            <Text weight="semibold" size={20}>Service Logs</Text>
        </View>
    )

    const listFooter = (
        <Button
            text="View All"
            type="outlined"
            onPress={handleViewAll}
            style={{ marginTop: heightPixel(10) }}
        />
    )

    return (
        <Wrapper bottom_bar>
            <FlatList
                data={data}
                renderItem={({ item }) => (
                    <ServiceLogCard
                        date={formatLongDate(item?.appointment_date ?? '')}
                        bookingId={`#${item?.id}`}
                        amount={item?.service?.charges || 0}
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