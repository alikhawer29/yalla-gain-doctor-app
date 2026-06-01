import { ActivityIndicator, RefreshControl, View } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import fonts from '../../assets/fonts';
import images from '../../assets/images';
import ProfileHeader from '../../components/ProfileHeader';
import Row from '../../components/Row';
import Text from '../../components/Text';
import Wrapper from '../../components/Wrapper';
import Icon from '../../components/Icon';
import Dropdown from '../../components/Dropdown';
import colors from '../../utils/colors';
import { font, heightPixel, PAGE_WIDTH, vw, widthPixel } from '../../utils/helper';
import styles from './styles';
import useDashboardController from './useDashboardController';

/** Whole numbers on Y axis (library defaults to e.g. 50.00). */
const formatYAxisInteger = (yLabel: string) => {
    const n = parseFloat(String(yLabel).replace(/,/g, ''));
    if (!Number.isFinite(n)) return yLabel;
    return String(Math.round(n));
};

const LINE_CHART_PADDING_BOTTOM = heightPixel(16);
const LINE_CHART_PADDING_TOP = heightPixel(8);

/** Inner width of graph card (wrapper padding + card padding). */
const CHART_AREA_WIDTH =
    PAGE_WIDTH - widthPixel(10) * 2 - widthPixel(15) * 2;

/** react-native-chart-kit: `style.paddingRight` = left gutter for Y-axis tick labels. */
const lineChartYAxisGutter = (values: number[], segments: number) => {
    const nums = values.filter((v) => typeof v === 'number' && Number.isFinite(v));
    const max = nums.length ? Math.max(0, ...nums) : 0;
    const min = 0;
    const seg = Math.max(1, segments);
    let maxDigits = 1;
    for (let i = 0; i <= seg; i++) {
        const tick = Math.round(min + ((max - min) * i) / seg);
        maxDigits = Math.max(maxDigits, String(tick).length);
    }
    return widthPixel(12 + maxDigits * 13);
};

const miniBarChartWidth = Math.max(widthPixel(100), Math.round(vw * 48 - widthPixel(42)));
const miniBarChartHeight = heightPixel(48);

/** Fewer horizontal ticks when the range is small so rounded labels are not duplicated (e.g. 0,1,1,2,2). */
const lineChartSegmentsForData = (values: number[]) => {
    const nums = values.filter((v) => typeof v === 'number' && Number.isFinite(v));
    if (nums.length === 0) return 1;
    const max = Math.max(0, ...nums);
    const min = Math.min(0, ...nums);
    const range = max - min;
    if (range === 0) return 1;
    if (range <= 2) return Math.max(1, Math.ceil(range));
    if (range <= 5) return Math.ceil(range);
    return 4;
};

const buildLineChartLayout = (
    values: number[],
    filter: 'weekly' | 'monthly' | 'yearly',
) => {
    const segments = lineChartSegmentsForData(values);
    const yGutter = lineChartYAxisGutter(values, segments);
    const xInset =
        filter === 'monthly' ? widthPixel(18) : filter === 'yearly' ? widthPixel(14) : widthPixel(10);
    const chartWidth = CHART_AREA_WIDTH - xInset;

    return {
        segments,
        width: chartWidth,
        yGutter,
        xLabelsOffset: widthPixel(8),
        yLabelsOffset: widthPixel(10),
    };
};

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

    const chartConfig = {
        backgroundGradientFrom: colors.grayish_black,
        backgroundGradientFromOpacity: 0,
        backgroundGradientTo: colors.grayish_black,
        backgroundGradientToOpacity: 0,
        color: (opacity = 1) => `rgba(17, 128, 118, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.5,
        useShadowColorFromDataset: false,
        formatYLabel: formatYAxisInteger,
    };

    const fullChartConfig = {
        ...chartConfig,
        color: (opacity = 1) => `rgba(17, 128, 118, ${opacity})`,
        labelColor: (opacity = 1) => colors.icon_gray,
        /** Used by LineChart for Y tick strings (default is 2 → "50.00"). */
        decimalPlaces: 0,
        propsForBackgroundLines: {
            strokeWidth: 1,
            stroke: colors.dark_gray,
        },
        propsForLabels: {
            fontFamily: fonts.sfpro.regular,
            fontSize: font(12),
        },
    };

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
    );
    const bookingsChartLayout = buildLineChartLayout(
        bookingsLineValues,
        bookingsFilter,
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
