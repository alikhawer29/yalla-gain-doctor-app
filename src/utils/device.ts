import { Platform } from 'react-native';

/** Backend expects e.g. ios | android */
export function getDeviceType(): string {
  return Platform.OS === 'ios' ? 'ios' : 'android';
}

/** Push token when FCM/APNs is wired; placeholder until then */
export function getDeviceToken(): string {
  return '';
}
