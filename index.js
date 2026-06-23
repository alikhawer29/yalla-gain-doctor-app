/**
 * @format
 */

import '@react-native-firebase/app';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import { AppRegistry } from 'react-native';
import { startNetworkLogging } from 'react-native-network-logger';
import App from './App';
import { name as appName } from './app.json';
import {
  displayNotificationFromRemoteMessage,
  ensureAndroidNotificationChannel,
} from './src/services/push/fcmDisplay';
import { invalidateNotificationsList } from './src/services/push/invalidateNotificationsList';
import { handleForceLogoutRemoteMessage } from './src/services/auth/forceLogout';

setBackgroundMessageHandler(getMessaging(), async remoteMessage => {
  const handled = await handleForceLogoutRemoteMessage(remoteMessage, {
    deferAlert: true,
  });
  await ensureAndroidNotificationChannel();
  if (handled) {
    await displayNotificationFromRemoteMessage(remoteMessage);
    return;
  }
  await displayNotificationFromRemoteMessage(remoteMessage);
  invalidateNotificationsList();
});

notifee.onBackgroundEvent(async () => {
  // Optional: handle action press when the app is in the background.
});

// Start network logging to monitor all API calls
startNetworkLogging({
  maxRequests: 500,
  forceEnable: true,
});

AppRegistry.registerComponent(appName, () => App);
