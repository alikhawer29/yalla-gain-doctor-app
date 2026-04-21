import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
} from 'react-native';
import dayjs from 'dayjs';
import Wrapper from '../../components/Wrapper';
import Text from '../../components/Text';
import Button from '../../components/Button';
import Touchable from '../../components/Touchable';
import colors from '../../utils/colors';
import { heightPixel } from '../../utils/helper';
import { maskIban } from '../../utils/walletUae';
import styles from './styles';
import useBeneficiariesController from './useBeneficiariesController';
import type { UaeBeneficiary } from '../../redux/Apis/User';

const formatDate = (d?: string) => {
  if (!d) return '—';
  const x = dayjs(d);
  return x.isValid() ? x.format('DD/MM/YYYY HH:mm') : d;
};

const Beneficiaries = () => {
  const [refreshing, setRefreshing] = useState(false);
  const {
    beneficiaries,
    isLoading,
    isFetching,
    isError,
    refetch,
    onAdd,
    onSelectWithdraw,
  } = useBeneficiariesController();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const renderItem = useCallback(
    ({ item }: { item: UaeBeneficiary }) => {
      const lp = item.last_payout;
      return (
        <Touchable onPress={() => onSelectWithdraw(item)} style={styles.card}>
          <View style={styles.rowBetween}>
            <Text color={colors.white} weight="bold" size={16}>
              {item.account_holder_name || '—'}
            </Text>
            {item.is_default_for_payout ? (
              <View style={styles.badge}>
                <Text color={colors.white} size={11}>
                  Default
                </Text>
              </View>
            ) : null}
          </View>
          <Text color={colors.icon_gray} size={13}>
            {maskIban(item.iban, item.iban_last4)} ·{' '}
            {item.currency || 'AED'}
          </Text>
          <Text color={colors.white} size={13} style={{ marginTop: 6 }}>
            Payouts:{' '}
            <Text weight="bold">
              {item.payouts_enabled ? 'Enabled' : 'Disabled'}
            </Text>
          </Text>
          {lp ? (
            <View style={styles.payoutBox}>
              <Text color={colors.white} size={12} weight="semibold">
                Last payout
              </Text>
              <Text color={colors.icon_gray} size={12} style={{ marginTop: 4 }}>
                {lp.amount != null ? `${lp.amount} AED` : '—'} ·{' '}
                {formatDate(lp.date || lp.created_at)} ·{' '}
                {lp.status || '—'}
              </Text>
            </View>
          ) : null}
          <Text
            color={colors.primary}
            size={12}
            style={{ marginTop: 10, textAlign: 'right' }}
          >
            Tap to withdraw →
          </Text>
        </Touchable>
      );
    },
    [onSelectWithdraw],
  );

  return (
    <Wrapper>
      <View style={styles.container}>
        <View style={styles.fabArea}>
          <Button
            text="Add new beneficiary"
            onPress={onAdd}
            rowJustify="flex-start"
            style={styles.button}
          />
        </View>

        {isError ? (
          <Text color={colors.danger} size={14} style={{ marginBottom: 12 }}>
            Could not load beneficiaries. Pull to retry.
          </Text>
        ) : null}

        {isLoading ? (
          <ActivityIndicator
            color={colors.primary}
            style={{ marginTop: heightPixel(60) }}
          />
        ) : (
          <FlatList
            data={beneficiaries}
            keyExtractor={item => String(item.id)}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
              />
            }
            ListEmptyComponent={
              <Text
                color={colors.icon_gray}
                size={14}
                style={{ textAlign: 'center', marginTop: 24 }}
              >
                No beneficiaries yet. Add one to withdraw funds.
              </Text>
            }
            ListFooterComponent={
              isFetching && !isLoading ? (
                <ActivityIndicator
                  color={colors.primary}
                  style={{ marginVertical: 16 }}
                />
              ) : null
            }
          />
        )}
      </View>
    </Wrapper>
  );
};

export default Beneficiaries;
