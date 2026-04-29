import { userApi } from '../../redux/Apis/User';
import { store } from '../../redux/Store';

/** Refetches all `getNotifications` caches so the header unread dot stays in sync with the API. */
export function invalidateNotificationsList(): void {
  store.dispatch(userApi.util.invalidateTags(['Notifications']));
}
