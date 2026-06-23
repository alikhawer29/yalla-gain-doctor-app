import {
  getAPNSToken,
  getInitialNotification,
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  registerDeviceForRemoteMessages,
  requestPermission,
} from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import { AppState, type AppStateStatus, PermissionsAndroid, Platform } from 'react-native';
import {
  displayNotificationFromRemoteMessage,
  ensureAndroidNotificationChannel,
} from './fcmDisplay';
import { invalidateNotificationsList } from './invalidateNotificationsList';
import { handleForceLogoutRemoteMessage, handleForceLogoutData } from '../auth/forceLogout';

const messaging = getMessaging();

async function handleNotificationData(
  data?: Record<string, string> | object,
): Promise<void> {
  if (!data || typeof data !== 'object') return;
  if (Object.keys(data).length === 0) return;
  await handleForceLogoutData(data);
}

/**
 * Requests notification permission, registers for remote messages (iOS),
 * and returns the FCM registration token (empty string if unavailable).
 *
 * On iOS we always register with APNs and retry `getToken`: returning early when
 * alert permission is denied left `device_token` empty so APIs that fall back to
 * `device_type` looked like they only received `ios`. FCM can still mint a token
 * after APNs registration; the token may also lag briefly after registration.
 */
export async function getFcmDeviceToken(): Promise<string> {
  try {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
    }

    await requestPermission(messaging);

    if (Platform.OS === 'ios') {
      await registerDeviceForRemoteMessages(messaging);
      // Native delegate sets FIRMessaging APNs token asynchronously after registration.
      await new Promise<void>(resolve => setTimeout(resolve, 400));
      for (let i = 0; i < 30; i++) {
        try {
          const apns = await getAPNSToken(messaging);
          if (apns != null) break;
        } catch {
          /* not registered yet — keep polling */
        }
        await new Promise<void>(resolve => setTimeout(resolve, 120));
      }
    }

    const readToken = async (): Promise<string> => {
      try {
        return (await getToken(messaging)) ?? '';
      } catch {
        return '';
      }
    };

    let token = await readToken();
    if (Platform.OS === 'ios' && !token) {
      for (let attempt = 0; attempt < 15; attempt++) {
        await new Promise<void>(resolve => setTimeout(resolve, 250));
        token = await readToken();
        if (token) break;
      }
    }
    return token;
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

  const unsubOnMessage = onMessage(messaging, async remoteMessage => {
    const handled = await handleForceLogoutRemoteMessage(remoteMessage);
    if (!handled) {
      await displayNotificationFromRemoteMessage(remoteMessage);
    }
    invalidateNotificationsList();
  });

  const unsubOpened = onNotificationOpenedApp(messaging, async remoteMessage => {
    const handled = await handleForceLogoutRemoteMessage(remoteMessage, {
      deferAlert: false,
    });
    if (!handled) {
      await handleNotificationData(remoteMessage?.data as Record<string, string> | undefined);
    }
    invalidateNotificationsList();
  });

  const unsubNotifee = notifee.onForegroundEvent(async ({ type, detail }) => {
    if (type === EventType.PRESS) {
      await handleNotificationData(detail.notification?.data);
    }
  });

  const initialRemote = await getInitialNotification(messaging);
  if (initialRemote) {
    const handled = await handleForceLogoutRemoteMessage(initialRemote, {
      deferAlert: false,
    });
    if (!handled && initialRemote.data) {
      await handleNotificationData(initialRemote.data as Record<string, string>);
    }
  }

  const initialNotifee = await notifee.getInitialNotification();
  if (initialNotifee?.notification?.data) {
    await handleNotificationData(initialNotifee.notification.data);
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
