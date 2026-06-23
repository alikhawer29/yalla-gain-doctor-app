import React, { useCallback, useState } from 'react';
import {
    View,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import Wrapper from '../../components/Wrapper';
import Text from '../../components/Text';
import Icon from '../../components/Icon';
import images from '../../assets/images';
import styles from './styles';
import colors from '../../utils/colors';
import { formatLongDate, heightPixel, widthPixel } from '../../utils/helper';
import FilterModal from './FilterModal';
import usePaymentLogsController from './usePaymentLogsController';
import { PaymentEarningsSummary, PaymentLogItem } from '../../redux/Apis/User';

type SummaryRowProps = {
    label: string;
    value?: number | null;
    prefix?: string;
    emphasize?: boolean;
    hint?: string;
};

const formatCoins = (value?: number | null) =>
    value != null ? String(value) : '—';

const SummaryRow = ({
    label,
    value,
    prefix = '',
    emphasize,
    hint,
}: SummaryRowProps) => (
    <View style={styles.summaryRow}>
        <View style={styles.summaryLabelCol}>
            <Text
                color={colors.white}
                size={emphasize ? 14 : 13}
                weight={emphasize ? 'semibold' : 'regular'}
            >
                {label}
            </Text>
            {hint ? (
                <Text color={colors.icon_gray} size={11} style={styles.summaryHint}>
                    {hint}
                </Text>
            ) : null}
        </View>
        <View style={styles.summaryValueRow}>
            <Text
                color={colors.white}
                size={emphasize ? 18 : 15}
                weight="bold"
            >
                {prefix}
                {formatCoins(value)}
            </Text>
            <Icon source={images.coin} size={13} />
        </View>
    </View>
);

const EarningsSummaryCard = ({
    summary,
}: {
    summary?: PaymentEarningsSummary;
}) => {
    const gross = summary?.gross_earnings;
    const tips = summary?.tips_received ?? 0;
    const service =
        gross != null ? Math.max(0, gross - tips) : null;
    const grossHint =
        gross != null && service != null
            ? tips > 0
                ? `(${service} service + ${tips} tip)`
                : `(${service} service)`
            : undefined;

    return (
        <View style={styles.summaryCard}>
            <SummaryRow
                label="Gross Earnings"
                value={summary?.gross_earnings}
                emphasize
            // hint={grossHint}
            />
            <SummaryRow
                label="Total Commission"
                value={summary?.total_commission}
                prefix="- "
            // hint="(service only)"
            />

            <View style={styles.summaryDivider} />

            <SummaryRow
                label="Net Earnings"
                value={summary?.net_earnings}
                emphasize
            />

            <View style={styles.summaryDivider} />

            <SummaryRow
                label="Paid Out"
                value={summary?.paid_out}
            // hint="(afer commission)"
            />
            <SummaryRow
                label="Tips Received"
                value={summary?.tips_received}
            // hint="(direct transfer)"
            />
            <SummaryRow
                label="Pending Payout"
                value={summary?.pending_payout}
            />
        </View>
    );
};

const PaymentLogs = () => {
    const [filterVisible, setFilterVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const {
        values: {
            logs,
            earningsSummary,
            filterFrom,
            filterTo,
            isLoading,
            isFetching,
            isError,
            canLoadMore,
            isLoadingMore,
        },
        functions: { applyDateFilter, loadMore, refetch },
    } = usePaymentLogsController();

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await refetch();
        } finally {
            setRefreshing(false);
        }
    }, [refetch]);

    const renderItem = useCallback(
        ({ item }: { item: PaymentLogItem }) => {
            const Coin = ({ label, value }: { label: string; value: string }) => (
                <View style={styles.cardItem}>
                    <Text color={colors.white} size={13} weight="regular">
                        {label} :{' '}
                        <Text color={colors.white} weight="bold">
                            {value}
                        </Text>
                    </Text>
                </View>
            );

            const CoinWithIcon = ({
                label,
                value,
            }: {
                label: string;
                value: string;
            }) => (
                <View style={styles.cardItem}>
                    <View style={styles.coinRow}>
                        <Text color={colors.white} size={13} weight="regular">
                            {label} :{' '}
                            <Text color={colors.white} weight="bold">
                                {value} Coins
                            </Text>
                        </Text>
                        <Icon source={images.coin} size={13} />
                    </View>
                </View>
            );

            return (
                <View style={styles.card}>
                    <View style={styles.cardRow}>
                        <Coin label="Booking Id" value={`#${item.booking_id}`} />
                    </View>
                    <View style={styles.cardRow}>
                        <CoinWithIcon
                            label="Booking Amount"
                            value={String(item.session_value ?? item.booking_amount)}
                        />
                    </View>
                    <View style={styles.cardRow}>
                        <Coin label="Booking Date" value={formatLongDate(item.booking_date ?? '')} />
                    </View>
                    <View style={styles.cardRow}>
                        <Coin label="Payment Date" value={formatLongDate(item.payment_date ?? '')} />
                    </View>
                    <View style={styles.cardRow}>
                        <CoinWithIcon
                            label="Payment Amount"
                            value={String(item.booking_payout ?? item.payment_amount)}
                        />
                    </View>
                    <View style={styles.cardRow}>
                        <CoinWithIcon label="Commission" value={String(item.commission)} />
                    </View>
                    <View style={styles.cardRow}>
                        <CoinWithIcon label="Tip" value={String(item.tip)} />
                    </View>
                    <View style={styles.cardRow}>
                        <Coin
                            label="Payout Status"
                            value={item.is_payout_done ? 'Paid' : 'Pending'}
                        />
                    </View>
                </View>
            );
        },
        [],
    );

    return (
        <Wrapper>
            <View style={styles.container}>
                <View style={styles.headerRow}>
                    <Text color={colors.white} size={16} weight="semibold">
                        Earnings Summary
                    </Text>
                    <TouchableOpacity
                        style={styles.filterBtn}
                        onPress={() => setFilterVisible(true)}
                    >
                        <Icon source={images.filters} size={20} />
                    </TouchableOpacity>
                </View>

                <EarningsSummaryCard summary={earningsSummary} />

                {isError ? (
                    <Text color={colors.danger} size={14} style={{ marginTop: 24 }}>
                        Could not load payment logs. Pull to retry.
                    </Text>
                ) : null}

                {isLoading ? (
                    <ActivityIndicator
                        color={colors.primary}
                        style={{ marginTop: heightPixel(80) }}
                    />
                ) : (
                    <FlatList
                        data={logs}
                        style={styles.list}
                        contentContainerStyle={styles.listContent}
                        renderItem={renderItem}
                        keyExtractor={item => String(item.id)}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor={colors.primary}
                            />
                        }
                        onEndReached={() => {
                            if (canLoadMore && !isFetching) loadMore();
                        }}
                        onEndReachedThreshold={0.35}
                        ListEmptyComponent={
                            !isLoading ? (
                                <Text
                                    color={colors.icon_gray}
                                    size={14}
                                    style={{ marginTop: widthPixel(40), textAlign: 'center' }}
                                >
                                    No payment logs yet.
                                </Text>
                            ) : null
                        }
                        ListFooterComponent={
                            isLoadingMore ? (
                                <ActivityIndicator
                                    color={colors.primary}
                                    style={{ marginVertical: 16 }}
                                />
                            ) : null
                        }
                    />
                )}
            </View>

            <FilterModal
                isVisible={filterVisible}
                onClose={() => setFilterVisible(false)}
                appliedFrom={filterFrom ?? ''}
                appliedTo={filterTo ?? ''}
                onApply={applyDateFilter}
            />
        </Wrapper>
    );
};

export default PaymentLogs;
