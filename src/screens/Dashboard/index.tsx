import { ActivityIndicator, RefreshControl, View } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import images from '../../assets/images';
import ProfileHeader from '../../components/ProfileHeader';
import Row from '../../components/Row';
import Text from '../../components/Text';
import Wrapper from '../../components/Wrapper';
import Icon from '../../components/Icon';
import Dropdown from '../../components/Dropdown';
import colors from '../../utils/colors';
import { heightPixel, vw, widthPixel } from '../../utils/helper';
import {
    buildLineChartLayout,
    createLineChartConfig,
    formatYAxisInteger,
    getChartAreaWidth,
    LINE_CHART_PADDING_BOTTOM,
    LINE_CHART_PADDING_TOP,
} from '../../utils/lineChart';
import styles from './styles';
import useDashboardController from './useDashboardController';

const DASHBOARD_CHART_AREA_WIDTH = getChartAreaWidth({
    wrapperHorizontal: widthPixel(10),
    cardHorizontal: widthPixel(15),
});

const miniBarChartWidth = Math.max(widthPixel(100), Math.round(vw * 48 - widthPixel(42)));
const miniBarChartHeight = heightPixel(48);

const Dashboard = () => {
    const {
        values: {
            total_bookings,
            total_earnings,
            earningsLineData,
            bookingsLineData,
            earningsFilter,
            bookingsFilter,
            graphFilterOptions,
            isStatsLoading,
            isEarningsGraphLoading,
            isBookingsGraphLoading,
            isRefreshing,
        },
        functions: { onEarningsFilterChange, onBookingsFilterChange, onRefresh },
    } = useDashboardController();

    const miniBarData = {
        labels: ['1', '2', '3', '4', '5', '6', '7', '8'],
        datasets: [
            {
                data: [20, 45, 28, 80, 99, 43, 80, 60],
            },
        ],
    };

    const chartConfig = createLineChartConfig(colors.grayish_black);
    const fullChartConfig = chartConfig;

    const earningsChartPayload = {
        labels: earningsLineData.labels,
        datasets: earningsLineData.datasets,
    };

    const bookingsChartPayload = {
        labels: bookingsLineData.labels,
        datasets: bookingsLineData.datasets,
    };

    const earningsLineValues = earningsChartPayload.datasets[0]?.data ?? [];
    const bookingsLineValues = bookingsChartPayload.datasets[0]?.data ?? [];
    const earningsChartLayout = buildLineChartLayout(
        earningsLineValues,
        earningsFilter,
        DASHBOARD_CHART_AREA_WIDTH,
    );
    const bookingsChartLayout = buildLineChartLayout(
        bookingsLineValues,
        bookingsFilter,
        DASHBOARD_CHART_AREA_WIDTH,
    );

    return (
        <Wrapper
            bottom_bar
            scrollable
            refreshControl={
                <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={onRefresh}
                    colors={[colors.primary]}
                    tintColor={colors.primary}
                />
            }
        >
            <View style={styles.container}>
                <ProfileHeader />

                <Row justify="space-between" align="stretch">
                    <View style={styles.topCard}>
                        <Row justify="space-between" align="flex-start">
                            <View style={styles.iconContainer}>
                                <Icon
                                    source={images.drawer_icons.my_bookings}
                                    size={20}
                                    tint_color={colors.white}
                                />
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text size={12} color={colors.white}>
                                    Total Booking
                                </Text>
                                {isStatsLoading ? (
                                    <ActivityIndicator color={colors.primary} />
                                ) : (
                                    <Text size={23} weight="bold" color={colors.white}>{total_bookings}</Text>
                                )}
                            </View>
                        </Row>
                        <View
                            style={{
                                height: miniBarChartHeight,
                                alignSelf: 'stretch',
                                overflow: 'hidden',
                            }}
                        >
                            <BarChart
                                data={miniBarData}
                                width={miniBarChartWidth}
                                height={miniBarChartHeight}
                                yAxisLabel=""
                                yAxisSuffix=""
                                chartConfig={{
                                    ...chartConfig,
                                    propsForBackgroundLines: { strokeWidth: 0 },
                                    fillShadowGradient: colors.primary,
                                    fillShadowGradientOpacity: 1,
                                }}
                                withHorizontalLabels={false}
                                withVerticalLabels={false}
                                withInnerLines={false}
                                showBarTops={false}
                                style={{
                                    paddingRight: widthPixel(2),
                                    paddingTop: heightPixel(2),
                                }}
                                flatColor={true}
                            />
                        </View>
                    </View>

                    <View style={styles.topCard}>
                        <Row justify="space-between" align="flex-start">
                            <View style={styles.iconContainer}>
                                <Icon source={images.coin} size={20} tint_color={colors.white} />
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text size={12} color={colors.white}>
                                    Total Earning
                                </Text>
                                {isStatsLoading ? (
                                    <ActivityIndicator color={colors.primary} />
                                ) : (
                                    <Text size={23} weight="bold" color={colors.white}>{total_earnings}</Text>
                                )}
                                <View style={styles.yallaCoinRow}>
                                    <Icon source={images.coin} size={12} />
                                    <Text size={10} color={colors.primary} weight="semibold">
                                        Yalla Coins
                                    </Text>
                                </View>
                            </View>
                        </Row>
                        <View
                            style={{
                                height: miniBarChartHeight,
                                alignSelf: 'stretch',
                                overflow: 'hidden',
                            }}
                        >
                            <BarChart
                                data={miniBarData}
                                width={miniBarChartWidth}
                                height={miniBarChartHeight}
                                yAxisLabel=""
                                yAxisSuffix=""
                                chartConfig={{
                                    ...chartConfig,
                                    propsForBackgroundLines: { strokeWidth: 0 },
                                    fillShadowGradient: colors.primary,
                                    fillShadowGradientOpacity: 1,
                                }}
                                withHorizontalLabels={false}
                                withVerticalLabels={false}
                                withInnerLines={false}
                                showBarTops={false}
                                style={{
                                    paddingRight: widthPixel(2),
                                    paddingTop: heightPixel(2),
                                }}
                                flatColor={true}
                            />
                        </View>
                    </View>
                </Row>

                <View style={styles.graphCard}>
                    <Row
                        justify="space-between"
                        align="center"
                        style={{ marginBottom: heightPixel(20) }}
                    >
                        <Text size={18} weight="semibold" color={colors.white}>
                            Total Earnings
                        </Text>
                        <View style={styles.dropdownContainer}>
                            <Dropdown
                                value={earningsFilter}
                                onChangeText={onEarningsFilterChange}
                                options={graphFilterOptions}
                                height={40}
                                textStyle={styles.filterDropdownText}
                            />
                        </View>
                    </Row>
                    {isEarningsGraphLoading ? (
                        <View style={styles.chartLoaderWrap}>
                            <ActivityIndicator color={colors.primary} />
                        </View>
                    ) : (
                        <View style={[styles.chartWrap, { minHeight: heightPixel(220) }]}>
                            <LineChart
                                data={earningsChartPayload}
                                width={earningsChartLayout.width}
                                height={heightPixel(220)}
                                chartConfig={fullChartConfig}
                                formatYLabel={formatYAxisInteger}
                                bezier
                                withDots={true}
                                withVerticalLines={false}
                                withOuterLines={false}
                                yAxisLabel=""
                                yAxisSuffix=""
                                fromZero={true}
                                segments={earningsChartLayout.segments}
                                xLabelsOffset={earningsChartLayout.xLabelsOffset}
                                yLabelsOffset={earningsChartLayout.yLabelsOffset}
                                style={{
                                    paddingRight: earningsChartLayout.yGutter,
                                    paddingLeft: widthPixel(4),
                                    paddingTop: LINE_CHART_PADDING_TOP,
                                    paddingBottom: LINE_CHART_PADDING_BOTTOM,
                                }}
                            />
                        </View>
                    )}
                </View>

                <View style={styles.graphCard}>
                    <Row
                        justify="space-between"
                        align="center"
                        style={{ marginBottom: heightPixel(20) }}
                    >
                        <Text size={18} weight="semibold" color={colors.white}>
                            Total Booking
                        </Text>
                        <View style={styles.dropdownContainer}>
                            <Dropdown
                                value={bookingsFilter}
                                onChangeText={onBookingsFilterChange}
                                options={graphFilterOptions}
                                height={40}
                                textStyle={styles.filterDropdownText}
                            />
                        </View>
                    </Row>
                    {isBookingsGraphLoading ? (
                        <View style={styles.chartLoaderWrap}>
                            <ActivityIndicator color={colors.primary} />
                        </View>
                    ) : (
                        <View style={[styles.chartWrap, { minHeight: heightPixel(220) }]}>
                            <LineChart
                                data={bookingsChartPayload}
                                width={bookingsChartLayout.width}
                                height={heightPixel(220)}
                                chartConfig={fullChartConfig}
                                formatYLabel={formatYAxisInteger}
                                bezier
                                withDots={true}
                                withVerticalLines={false}
                                withOuterLines={false}
                                yAxisLabel=""
                                yAxisSuffix=""
                                fromZero={true}
                                segments={bookingsChartLayout.segments}
                                xLabelsOffset={bookingsChartLayout.xLabelsOffset}
                                yLabelsOffset={bookingsChartLayout.yLabelsOffset}
                                style={{
                                    paddingRight: bookingsChartLayout.yGutter,
                                    paddingLeft: widthPixel(4),
                                    paddingTop: LINE_CHART_PADDING_TOP,
                                    paddingBottom: LINE_CHART_PADDING_BOTTOM,
                                }}
                            />
                        </View>
                    )}
                </View>
            </View>
        </Wrapper>
    );
};

export default Dashboard;
