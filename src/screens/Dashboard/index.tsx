import { ActivityIndicator, ImageSourcePropType, RefreshControl, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import images from '../../assets/images';
import ProfileHeader from '../../components/ProfileHeader';
import Row from '../../components/Row';
import Text from '../../components/Text';
import Wrapper from '../../components/Wrapper';
import Icon from '../../components/Icon';
import Image from '../../components/Image';
import Dropdown from '../../components/Dropdown';
import colors from '../../utils/colors';
import { heightPixel, widthPixel } from '../../utils/helper';
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

type StatCardProps = {
    label: string;
    value: number;
    icon: ImageSourcePropType;
    loading?: boolean;
    showCoins?: boolean;
};

const formatStatValue = (value: number) =>
    Number.isInteger(value) ? String(value) : String(value);

const StatCard = ({ label, value, icon, loading, showCoins }: StatCardProps) => (
    <View style={styles.statCard}>
        <View style={styles.statCardBody}>
            <Row justify="space-between" align="flex-start">
                {/* <View style={styles.iconContainer}> */}
                <Image source={icon} style={{ width: heightPixel(50), height: heightPixel(50) }} />
                {/* </View> */}
                <View style={{ alignItems: 'flex-end', flex: 1, marginLeft: widthPixel(8) }}>
                    <Text size={12} color={colors.white}>
                        {label}
                    </Text>
                    {loading ? (
                        <ActivityIndicator color={colors.primary} style={{ marginTop: heightPixel(6) }} />
                    ) : (
                        <Text size={23} weight="bold" color={colors.white}>
                            {formatStatValue(value)}
                        </Text>
                    )}
                    {showCoins ? (
                        <View style={styles.yallaCoinRow}>
                            <Icon source={images.coin} size={12} />
                            <Text size={10} color={colors.primary} weight="semibold">
                                Yalla Coins
                            </Text>
                        </View>
                    ) : null}
                </View>
            </Row>
        </View>
        <View style={styles.cardGraphWrap}>
            <Image source={images.card_graph} style={styles.cardGraph} resize="contain" />
        </View>
    </View>
);

const Dashboard = () => {
    const {
        values: {
            total_bookings,
            total_coins,
            paid_out,
            pending_payout,
            total_tips_received,
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

    const chartConfig = createLineChartConfig(colors.grayish_black);

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

                <View style={styles.statsGrid}>
                    <StatCard
                        label="Total Booking"
                        value={total_bookings}
                        icon={images.total_bookings}
                        loading={isStatsLoading}
                    />
                    <StatCard
                        label="Total Earning"
                        value={total_coins}
                        icon={images.total_earnings}
                        loading={isStatsLoading}
                        showCoins
                    />
                    <StatCard
                        label="Paid Out"
                        value={paid_out}
                        icon={images.total_earnings}
                        loading={isStatsLoading}
                        showCoins
                    />
                    <StatCard
                        label="Pending Payout"
                        value={pending_payout}
                        icon={images.total_earnings}
                        loading={isStatsLoading}
                        showCoins
                    />
                    <StatCard
                        label="Tips Received"
                        value={total_tips_received}
                        icon={images.total_earnings}
                        loading={isStatsLoading}
                        showCoins
                    />
                </View>

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
                                chartConfig={chartConfig}
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
                                chartConfig={chartConfig}
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
