import notifee, { AndroidImportance } from '@notifee/react-native';
import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

export const FCM_DEFAULT_CHANNEL_ID = 'fcm_default';

export async function ensureAndroidNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await notifee.createChannel({
    id: FCM_DEFAULT_CHANNEL_ID,
    name: 'General',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
  });
}

/** Converts FCM data payload values to strings for Notifee. */
/** Converts FCM data payload values to strings for Notifee. */
function stringifyData(
  data?: FirebaseMessagingTypes.RemoteMessage['data'],
): Record<string, string> {
  if (!data) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined || v === null) continue;
    out[k] = typeof v === 'string' ? v : String(v);
  }
  return out;
}

export async function displayNotificationFromRemoteMessage(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): Promise<void> {
  const { notification, data } = remoteMessage;
  const title =
    notification?.title ??
    (data?.title != null ? String(data.title) : undefined) ??
    'YallaGain Doctor';
  const body =
    notification?.body ??
    (data?.body != null ? String(data.body) : undefined) ??
    '';

  await notifee.displayNotification({
    title,
    body,
    data: stringifyData(data),
    android: {
      channelId: FCM_DEFAULT_CHANNEL_ID,
      importance: AndroidImportance.HIGH,
      pressAction: {
        id: 'default',
        launchActivity: 'default',
      },
    },
    ios: {
      foregroundPresentationOptions: {
        badge: true,
        sound: true,
        banner: true,
        list: true,
      },
    },
  });
}
