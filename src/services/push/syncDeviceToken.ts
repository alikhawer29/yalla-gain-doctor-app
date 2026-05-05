import { Platform } from 'react-native';
import { store } from '../../redux/Store';
import { userApi } from '../../redux/Apis/User';

/**
 * Posts the latest FCM device token + device_type to the backend so the
 * server always has a fresh token after reinstalls or Firebase rotations.
 * Silently ignores errors so it never blocks the app.
 */
export async function syncDeviceToken(token: string): Promise<void> {
  if (!token) return;

  const state = store.getState() as any;
  if (!state?.auth?.isLoggedIn) return;

  const device_type: 'ios' | 'android' =
    Platform.OS === 'ios' ? 'ios' : 'android';

  try {
    const formData = new FormData();
    formData.append('device_token', token);
    formData.append('device_type', device_type);

    await store.dispatch(
      userApi.endpoints.updateProfile.initiate(formData, {
        fixedCacheKey: 'device-token-sync',
      }),
    );
  } catch {
    // silent — never block the app for a token sync
  }
}
