import { FlatList, View } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { LineChart } from "react-native-chart-kit"
import fonts from "../../assets/fonts"
import images from "../../assets/images"
import InfoCard from "../../components/Cards/InfoCard"
import ProgressCard from "../../components/Cards/ProgressCard"
import TrackingCard from "../../components/Cards/TrackingCard"
import VideoCard from "../../components/Cards/VideoCard"
import WorkoutCard from "../../components/Cards/WorkoutCard"
import ServiceLogCard from "../../components/Cards/ServiceLogCard"
import ProfileHeader from "../../components/ProfileHeader"
import Row from "../../components/Row"
import Text from "../../components/Text"
import Wrapper from "../../components/Wrapper"
import Button from "../../components/Button"
import colors from "../../utils/colors"
import { NAVIGATORS, ROUTES } from "../../utils/routes"
import { PROGRESS_TRACKING, RECOMMENDED_VIDEOS, WORKOUT_PLANS } from "../../utils/data"
import { font, heightPixel, vw, widthPixel } from "../../utils/helper"
import Image from "../../components/Image"
import Empty from "../../components/Empty"
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
            isLoading,
            selected,
            search
        },
        functions: {
            onReload,
            onPressCard,
            onChangeStatus,
            onSearch
        }
    } = useServiceLogsController()

    const handleViewAll = () => {
        ; (navigation as any).navigate(NAVIGATORS.BOOKING_STACK, { screen: ROUTES.SERVICE_LOGS })
    }

    console.log("data", data)

    return (
        <Wrapper bottom_bar scrollable>
            <View style={{ gap: heightPixel(10) }}>
                <ProfileHeader />
                <View style={{ gap: heightPixel(10), marginVertical: heightPixel(15) }}>
                    <Image source={images.home} style={{ height: heightPixel(180), borderRadius: heightPixel(10) }} />
                    <Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar sic tempor. Sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus</Text>
                </View>
                <View style={{ gap: heightPixel(10) }}>
                    <Text weight="semibold" size={20}>Service Logs</Text>
                    <FlatList
                        data={data}
                        renderItem={({ item }) => (
                            <ServiceLogCard
                                date={item?.appointment_date}
                                bookingId={item?.booking_id}
                                amount={item?.service?.charges || 0}
                                status={item?.status}
                                onPress={() => onPressCard(item?.id)}
                            />
                        )}
                        showsVerticalScrollIndicator={false}
                        ItemSeparatorComponent={() => <View style={{ height: heightPixel(10) }} />}
                        ListEmptyComponent={() => <Empty message="No Service Logs Found" />}
                        keyExtractor={(item) => item?.id?.toString()}
                        style={{ maxHeight: heightPixel(225) }}
                    />
                    <Button text="View All" type="outlined" onPress={handleViewAll} style={{ marginTop: heightPixel(10) }} />
                </View>
            </View>

        </Wrapper>
    )
}

export default Home