import { userApi } from '../../redux/Apis/User';
import { store } from '../../redux/Store';

/** Keep notifications + consultation lists in sync when a push arrives. */
export function invalidateNotificationsList(): void {
  store.dispatch(
    userApi.util.invalidateTags([
      'Notifications',
      'Bookings',
      { type: 'Services', id: 'LIST' },
    ]),
  );
}
