import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { NOTIFICATIONS_FIRST_PAGE } from '../../constants/notificationsQuery';
import images from '../../assets/images';
import Icon from '../../components/Icon';
import Touchable from '../../components/Touchable';
import { useGetNotificationsQuery } from '../../redux/Apis/User';
import { RootState } from '../../redux/Store';
import colors from '../../utils/colors';
import { heightPixel, widthPixel } from '../../utils/helper';

type Props = {
  onPress: () => void;
};

const NotificationHeaderIcon = ({ onPress }: Props) => {
  const token = useSelector((s: RootState) => s.auth.token);

  const { data, refetch } = useGetNotificationsQuery(NOTIFICATIONS_FIRST_PAGE, {
    skip: !token,
    refetchOnMountOrArgChange: true,
  });

  /** Pick up read/unread changes when returning from Notification or other flows. */
  useFocusEffect(
    useCallback(() => {
      if (token) {
        refetch();
      }
    }, [token, refetch]),
  );

  const hasUnread = useMemo(() => {
    const items = data?.data ?? [];
    return items.some((item: { read?: boolean }) => !item.read);
  }, [data]);

  return (
    <Touchable onPress={onPress} style={styles.sideSpace}>
      <View style={styles.iconWrap}>
        <Icon
          source={images.notifications}
          border={colors.white}
          size={40}
          rounded
          less_rounded
          less_padding
        />
        {hasUnread ? (
          <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
        ) : null}
      </View>
    </Touchable>
  );
};

const styles = StyleSheet.create({
  sideSpace: {
    width: widthPixel(40),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
  },
  iconWrap: {
    width: widthPixel(40),
    height: heightPixel(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: heightPixel(4),
    right: widthPixel(4),
    width: widthPixel(8),
    height: widthPixel(8),
    borderRadius: widthPixel(4),
  },
});

export default NotificationHeaderIcon;
