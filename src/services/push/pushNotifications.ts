import messaging, { AuthorizationStatus } from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import { AppState, type AppStateStatus, PermissionsAndroid, Platform } from 'react-native';
import {
  displayNotificationFromRemoteMessage,
  ensureAndroidNotificationChannel,
} from './fcmDisplay';
import { invalidateNotificationsList } from './invalidateNotificationsList';

/**
 * Optional: handle taps / cold start; extend when the API sends `data` routes.
 */
function handleNotificationData(_data?: Record<string, string> | object): void {
  if (!_data || typeof _data !== 'object') return;
  if (Object.keys(_data).length === 0) return;
}

/**
 * Requests notification permission, registers for remote messages (iOS),
 * and returns the FCM registration token (empty string if unavailable).
 */
export async function getFcmDeviceToken(): Promise<string> {
  try {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
    }

    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL ||
      authStatus === AuthorizationStatus.EPHEMERAL;

    if (Platform.OS === 'ios') {
      if (!enabled) return '';
      await messaging().registerDeviceForRemoteMessages();
    }

    const token = await messaging().getToken();
    return token ?? '';
  } catch {
    return '';
  }
}

/**
 * Subscribes to FCM and Notifee (foreground). Call once after app mounts.
 * Returns a cleanup function.
 */
export async function setupForegroundPushHandlers(): Promise<() => void> {
  await ensureAndroidNotificationChannel();

  const unsubOnMessage = messaging().onMessage(async remoteMessage => {
    await displayNotificationFromRemoteMessage(remoteMessage);
    invalidateNotificationsList();
  });

  const unsubOpened = messaging().onNotificationOpenedApp(remoteMessage => {
    handleNotificationData(remoteMessage?.data as Record<string, string> | undefined);
    invalidateNotificationsList();
  });

  const unsubNotifee = notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.PRESS) {
      handleNotificationData(detail.notification?.data);
    }
  });

  const initialRemote = await messaging().getInitialNotification();
  if (initialRemote?.data) {
    handleNotificationData(initialRemote.data as Record<string, string>);
  }

  const initialNotifee = await notifee.getInitialNotification();
  if (initialNotifee?.notification?.data) {
    handleNotificationData(initialNotifee.notification.data);
  }

  let appState = AppState.currentState;
  const appStateSub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
    const wasBackground = /inactive|background/.test(appState);
    if (wasBackground && nextState === 'active') {
      invalidateNotificationsList();
    }
    appState = nextState;
  });

  /** Sync bell dot after opens from killed state (no background→active transition). */
  invalidateNotificationsList();

  return () => {
    unsubOnMessage();
    unsubOpened();
    unsubNotifee();
    appStateSub.remove();
  };
}
