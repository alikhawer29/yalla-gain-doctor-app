import { Platform } from 'react-native';
import { getFcmDeviceToken } from '../services/push/pushNotifications';

export { getFcmDeviceToken };

/** Backend expects `ios` | `android` */
export function getDeviceType(): 'ios' | 'android' {
  return Platform.OS === 'ios' ? 'ios' : 'android';
}
