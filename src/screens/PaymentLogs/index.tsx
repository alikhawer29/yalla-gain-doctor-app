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
import { PaymentLogItem } from '../../redux/Apis/User';

type SummaryStatProps = {
    label: string;
    value?: number | null;
    emphasize?: boolean;
};

const SummaryStat = ({ label, value, emphasize }: SummaryStatProps) => (
    <View style={[styles.summaryStat, emphasize && styles.summaryStatMain]}>
        <Text color={colors.icon_gray} size={12}>
            {label}
        </Text>
        <View style={styles.summaryValueRow}>
            <Text
                color={colors.white}
                size={emphasize ? 22 : 16}
                weight="bold"
            >
                {value != null ? value : '—'}
            </Text>
            <Icon source={images.coin} size={emphasize ? 16 : 13} />
            <Text color={colors.primary} size={10} weight="semibold">
                Yalla Coins
            </Text>
        </View>
    </View>
);

const PaymentLogs = () => {
    const [filterVisible, setFilterVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const {
        values: {
            logs,
            totalEarnings,
            totalRealized,
            totalUnrealized,
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
                        <Coin label="Booking Id" value={`#${item.id}`} />
                    </View>
                    <View style={styles.cardRow}>
                        <CoinWithIcon
                            label="Booking Amount"
                            value={String(item.booking_amount)}
                        />
                    </View>
                    <View style={styles.cardRow}>
                        <Coin label="Payment Date" value={formatLongDate(item.payment_date ?? '')} />

                    </View>
                    <View style={styles.cardRow}>
                        <CoinWithIcon
                            label="Payment Amount"
                            value={String(item.payment_amount)}
                        />
                    </View>
                    <View style={styles.cardRow}>
                        <CoinWithIcon label="Commission" value={String(item.commission)} />
                    </View>
                    <View style={styles.cardRow}>
                        <CoinWithIcon label="Tip" value={String(item.tip)} />
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
                        Earnings summary
                    </Text>
                    <TouchableOpacity
                        style={styles.filterBtn}
                        onPress={() => setFilterVisible(true)}
                    >
                        <Icon source={images.filters} size={20} />
                    </TouchableOpacity>
                </View>

                <View style={styles.summaryCard}>
                    <SummaryStat
                        label="Total Earnings"
                        value={totalEarnings}
                        emphasize
                    />
                    <View style={styles.summaryDivider} />
                    <View style={styles.summarySubRow}>
                        <View style={styles.summaryHalf}>
                            <SummaryStat label="Realized (After Commission)" value={totalRealized} />
                        </View>
                        <View style={styles.summaryVerticalDivider} />
                        <View style={styles.summaryHalf}>
                            <SummaryStat label="Unrealized" value={totalUnrealized} />
                        </View>
                    </View>
                </View>

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
