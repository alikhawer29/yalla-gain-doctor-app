import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  View,
} from 'react-native';
import dayjs from 'dayjs';
import Wrapper from '../../components/Wrapper';
import Text from '../../components/Text';
import Icon from '../../components/Icon';
import images from '../../assets/images';
import colors from '../../utils/colors';
import { heightPixel, widthPixel } from '../../utils/helper';
import FilterModal from '../PaymentLogs/FilterModal';
import styles from './styles';
import useWalletTransactionLogsController, {
  StatusFilter,
} from './useWalletTransactionLogsController';
import { UaeTransactionLogItem } from '../../redux/Apis/User';

const formatDisplayDate = (iso?: string) => {
  if (!iso) return '—';
  const d = dayjs(iso);
  return d.isValid() ? d.format('DD/MM/YYYY HH:mm') : iso;
};

const WalletTransactionLogs = () => {
  const [filterVisible, setFilterVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const {
    values: {
      logs,
      status,
      filterFrom,
      filterTo,
      isLoading,
      isFetching,
      isError,
      canLoadMore,
      isLoadingMore,
    },
    functions: { setStatus, loadMore, refetch, applyDateFilter },
  } = useWalletTransactionLogsController();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const statusOptions: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'paid', label: 'Paid' },
    { key: 'pending', label: 'Pending' },
  ];

  const renderItem = useCallback(
    ({ item }: { item: UaeTransactionLogItem }) => {
      const b = item.beneficiary;
      const name =
        b?.account_holder_name || b?.name || (item as { beneficiary_name?: string }).beneficiary_name;
      const last4 =
        b?.iban_last4 ||
        (b?.iban ? String(b.iban).replace(/\s/g, '').slice(-4) : undefined) ||
        (item as { iban_last4?: string }).iban_last4;
      const typeLabel = item.type || 'withdrawal';
      const ccy = (item.currency || 'AED').toUpperCase();
      const amt = item.amount != null ? `${item.amount}` : '—';
      const coins = item.coins_deducted != null ? String(item.coins_deducted) : '—';
      const when = item.date || item.created_at || item.payment_date;
      const refId = item.stripe_payout_id;

      return (
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text color={colors.white} size={15} weight="bold">
              {amt} {ccy} · {String(item.status || '—')}
            </Text>
          </View>
          <Text color={colors.icon_gray} size={13}>
            Type: {typeLabel} · {formatDisplayDate(when)}
          </Text>
          <Text color={colors.white} size={13} style={{ marginTop: 4 }}>
            Coins deducted: {coins}
          </Text>
          {item.coins_balance_before != null || item.coins_balance_after != null ? (
            <Text color={colors.icon_gray} size={12} style={{ marginTop: 4 }}>
              Balance: {String(item.coins_balance_before ?? '—')} →{' '}
              {String(item.coins_balance_after ?? '—')}
            </Text>
          ) : null}
          <Text color={colors.white} size={13} style={{ marginTop: 8 }}>
            Beneficiary: {name || '—'}
            {last4 ? ` · ****${String(last4).slice(-4)}` : ''}
          </Text>
          {/* {refId ? (
            <Text color={colors.icon_gray} size={11} style={{ marginTop: 4 }}>
              Ref: {refId}
            </Text>
          ) : null} */}
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
            Wallet withdrawals
          </Text>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setFilterVisible(true)}
          >
            <Icon source={images.filters} size={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.chipRow}>
          {statusOptions.map(o => (
            <TouchableOpacity
              key={o.key}
              style={[styles.chip, status === o.key && styles.chipActive]}
              onPress={() => setStatus(o.key)}
            >
              <Text color={colors.white} size={13}>
                {o.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isError ? (
          <Text color={colors.danger} size={14} style={{ marginBottom: 12 }}>
            Could not load transaction logs. Pull to retry.
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
            renderItem={renderItem}
            keyExtractor={(item, index) =>
              item.id != null ? String(item.id) : `tx-${index}`
            }
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
                  No transactions yet.
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

export default WalletTransactionLogs;
