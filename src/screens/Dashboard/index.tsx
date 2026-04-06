import { View } from "react-native"
import { BarChart, LineChart } from "react-native-chart-kit"
import { useNavigation } from "@react-navigation/native"
import fonts from "../../assets/fonts"
import images from "../../assets/images"
import ProfileHeader from "../../components/ProfileHeader"
import Row from "../../components/Row"
import Text from "../../components/Text"
import Wrapper from "../../components/Wrapper"
import Icon from "../../components/Icon"
import Dropdown from "../../components/Dropdown"
import colors from "../../utils/colors"
import { font, heightPixel, vw, widthPixel } from "../../utils/helper"
import styles from "./styles"
import useDashboardController from "./useDashboardController"

const Dashboard = () => {
    const navigation = useNavigation()

    const {
        values: {
            user,
            earningsData,
            bookingsData,
            bookingFilter,
            earningsFilter
        },
        functions: {
            setBookingFilter,
            setEarningsFilter
        }
    } = useDashboardController()

    const miniBarData = {
        labels: ["1", "2", "3", "4", "5", "6", "7", "8"],
        datasets: [
            {
                data: [20, 45, 28, 80, 99, 43, 80, 60]
            }
        ]
    };

    const chartConfig = {
        backgroundGradientFrom: colors.grayish_black,
        backgroundGradientFromOpacity: 0,
        backgroundGradientTo: colors.grayish_black,
        backgroundGradientToOpacity: 0,
        color: (opacity = 1) => `rgba(17, 128, 118, ${opacity})`, // colors.primary
        strokeWidth: 2, // optional, default 3
        barPercentage: 0.5,
        useShadowColorFromDataset: false,
    };

    const fullChartConfig = {
        ...chartConfig,
        color: (opacity = 1) => `rgba(17, 128, 118, ${opacity})`,
        labelColor: (opacity = 1) => colors.icon_gray,
        propsForBackgroundLines: {
            strokeWidth: 1,
            stroke: colors.dark_gray,
        },
        propsForLabels: {
            fontFamily: fonts.sfpro.regular,
            fontSize: font(10),
        }
    };

    return (
        <Wrapper bottom_bar scrollable>
            <View style={styles.container}>
                <ProfileHeader />

                <Row justify="space-between" align="stretch">
                    {/* Total Booking Card */}
                    <View style={styles.topCard}>
                        <Row justify="space-between" align="flex-start">
                            <View style={styles.iconContainer}>
                                <Icon source={images.drawer_icons.my_bookings} size={20} tint_color={colors.white} />
                            </View>
                            <View style={{ alignItems: "flex-end" }}>
                                <Text size={12} color={colors.white}>Total Booking</Text>
                                <Text style={styles.topCardValue}>33</Text>
                            </View>
                        </Row>
                        <View style={{ height: heightPixel(60), marginLeft: -widthPixel(40), marginBottom: -heightPixel(10) }}>
                            <BarChart
                                data={miniBarData}
                                width={vw * 45} // slightly smaller than the container 48%
                                height={heightPixel(80)}
                                yAxisLabel=""
                                yAxisSuffix=""
                                chartConfig={{
                                    ...chartConfig,
                                    propsForBackgroundLines: { strokeWidth: 0 },
                                    fillShadowGradient: colors.primary,
                                    fillShadowGradientOpacity: 1,
                                }}
                                withHorizontalLabels={false}
                                withInnerLines={false}
                                showBarTops={false}
                                style={{ paddingRight: 0 }}
                                flatColor={true}
                                hideLegend={true}
                            />
                        </View>
                    </View>

                    {/* Total Earning Card */}
                    <View style={styles.topCard}>
                        <Row justify="space-between" align="flex-start">
                            <View style={styles.iconContainer}>
                                <Icon source={images.coin} size={20} tint_color={colors.white} />
                            </View>
                            <View style={{ alignItems: "flex-end" }}>
                                <Text size={12} color={colors.white}>Total Earning</Text>
                                <Text style={styles.topCardValue}>2000</Text>
                                <View style={styles.yallaCoinRow}>
                                    <Icon source={images.coin} size={12} />
                                    <Text size={10} color={colors.primary} weight="semibold">Yalla Coins</Text>
                                </View>
                            </View>
                        </Row>
                        <View style={{ height: heightPixel(60), marginLeft: -widthPixel(40), marginBottom: -heightPixel(10) }}>
                            <BarChart
                                data={miniBarData}
                                width={vw * 45}
                                height={heightPixel(80)}
                                yAxisLabel=""
                                yAxisSuffix=""
                                chartConfig={{
                                    ...chartConfig,
                                    propsForBackgroundLines: { strokeWidth: 0 },
                                    fillShadowGradient: colors.primary,
                                    fillShadowGradientOpacity: 1,
                                }}
                                withHorizontalLabels={false}
                                withInnerLines={false}
                                showBarTops={false}
                                style={{ paddingRight: 0 }}
                                flatColor={true}
                            />
                        </View>
                    </View>
                </Row>

                {/* Total Earnings Graph */}
                <View style={styles.graphCard}>
                    <Row justify="space-between" align="center" style={{ marginBottom: heightPixel(20) }}>
                        <Text size={18} weight="semibold" color={colors.white}>Total Earnings</Text>
                        <View style={styles.dropdownContainer}>
                            <Dropdown
                                value={earningsFilter}
                                onChangeText={setEarningsFilter}
                                options={[
                                    { label: 'Weekly', value: 'Weekly' },
                                    { label: 'Monthly', value: 'Monthly' },
                                    { label: 'Yearly', value: 'Yearly' },
                                ]}
                                height={10}
                            />
                        </View>
                    </Row>
                    <View style={{ marginLeft: -widthPixel(20) }}>
                        <LineChart
                            data={earningsData}
                            width={vw * 100 - widthPixel(20)}
                            height={heightPixel(220)}
                            chartConfig={fullChartConfig}
                            bezier
                            withDots={true}
                            withVerticalLines={false}
                            withOuterLines={false}
                            yAxisLabel=""
                            yAxisSuffix="k"
                            fromZero={true}
                        />
                    </View>
                </View>

                {/* Total Booking Graph */}
                <View style={styles.graphCard}>
                    <Row justify="space-between" align="center" style={{ marginBottom: heightPixel(20) }}>
                        <Text size={18} weight="semibold" color={colors.white}>Total Booking</Text>
                        <View style={styles.dropdownContainer}>
                            <Dropdown
                                value={bookingFilter}
                                onChangeText={setBookingFilter}
                                options={[
                                    { label: 'Weekly', value: 'Weekly' },
                                    { label: 'Monthly', value: 'Monthly' },
                                    { label: 'Yearly', value: 'Yearly' },
                                ]}
                                height={40}
                            />
                        </View>
                    </Row>
                    <View style={{ marginLeft: -widthPixel(20) }}>
                        <LineChart
                            data={bookingsData}
                            width={vw * 100 - widthPixel(20)}
                            height={heightPixel(220)}
                            chartConfig={fullChartConfig}
                            bezier
                            withDots={true}
                            withVerticalLines={false}
                            withOuterLines={false}
                            yAxisLabel=""
                            yAxisSuffix="k"
                            fromZero={true}
                        />
                    </View>
                </View>

            </View>
        </Wrapper>
    )
}

export default Dashboard
