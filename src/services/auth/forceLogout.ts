import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { AppState } from 'react-native';
import { authApi } from '../../redux/Apis/Auth';
import { chatApi } from '../../redux/Apis/Chat';
import { chatbotApi } from '../../redux/Apis/Chatbot';
import { movementCorrectionApi } from '../../redux/Apis/MovementCorrection';
import { userApi } from '../../redux/Apis/User';
import { logout } from '../../redux/Slices/AuthSlice';
import { logoutSpotify } from '../../redux/Slices/SpotifySlice';
import { persistor, store } from '../../redux/Store';
import { NAVIGATORS, ROUTES } from '../../utils/routes';
import { navigationRef } from '../../utils/navigation';
import { CommonActions } from '@react-navigation/native';

export const FORCE_LOGOUT_TYPE = 'FORCE_LOGOUT';
const PENDING_FORCE_LOGOUT_KEY = 'pending_force_logout';

export type ForceLogoutAlert = {
  title: string;
  body: string;
};

type ForceLogoutListener = (payload: ForceLogoutAlert) => void;
const alertListeners = new Set<ForceLogoutListener>();

export function onForceLogoutAlert(listener: ForceLogoutListener): () => void {
  alertListeners.add(listener);
  return () => alertListeners.delete(listener);
}

function emitForceLogoutAlert(payload: ForceLogoutAlert): void {
  alertListeners.forEach(listener => listener(payload));
}

function normalizeData(
  data?: Record<string, unknown> | object | null,
): Record<string, string> | null {
  if (!data || typeof data !== 'object') return null;
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value == null) continue;
    out[key] = typeof value === 'string' ? value : String(value);
  }
  return out;
}

export function isForceLogoutPayload(
  data?: Record<string, unknown> | object | null,
): boolean {
  const normalized = normalizeData(data);
  if (!normalized?.type) return false;
  return normalized.type.toUpperCase() === FORCE_LOGOUT_TYPE;
}

export function parseForceLogoutPayload(
  data?: Record<string, unknown> | object | null,
  notification?: FirebaseMessagingTypes.RemoteMessage['notification'],
): ForceLogoutAlert | null {
  if (!isForceLogoutPayload(data)) return null;
  const normalized = normalizeData(data)!;
  return {
    title:
      normalized.title ||
      notification?.title ||
      'Account Deactivated',
    body:
      normalized.body ||
      normalized.message ||
      notification?.body ||
      'Your account has been deactivated. Please contact support.',
  };
}

async function clearPersistedSession(): Promise<void> {
  store.dispatch(logout());
  store.dispatch(logoutSpotify());
  store.dispatch(authApi.util.resetApiState());
  store.dispatch(userApi.util.resetApiState());
  store.dispatch(chatApi.util.resetApiState());
  store.dispatch(chatbotApi.util.resetApiState());
  store.dispatch(movementCorrectionApi.util.resetApiState());

  try {
    await persistor.purge();
  } catch {
    /* ignore */
  }

  try {
    await AsyncStorage.clear();
  } catch {
    /* ignore */
  }
}

async function savePendingForceLogoutAlert(payload: ForceLogoutAlert): Promise<void> {
  try {
    await AsyncStorage.setItem(PENDING_FORCE_LOGOUT_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export async function consumePendingForceLogoutAlert(): Promise<ForceLogoutAlert | null> {
  try {
    const raw = await AsyncStorage.getItem(PENDING_FORCE_LOGOUT_KEY);
    if (!raw) return null;
    await AsyncStorage.removeItem(PENDING_FORCE_LOGOUT_KEY);
    return JSON.parse(raw) as ForceLogoutAlert;
  } catch {
    return null;
  }
}

export function resetToLoginScreen(): void {
  const dispatchReset = (): boolean => {
    if (!navigationRef.isReady()) return false;

    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: NAVIGATORS.AUTH_STACK,
            state: {
              index: 0,
              routes: [{ name: ROUTES.USER_ENTRY }],
            },
          },
        ],
      } as never),
    );
    return true;
  };

  if (dispatchReset()) return;

  let attempts = 0;
  const timer = setInterval(() => {
    attempts += 1;
    if (dispatchReset() || attempts >= 30) {
      clearInterval(timer);
    }
  }, 100);
}

export async function performForceLogout(payload: ForceLogoutAlert): Promise<void> {
  await clearPersistedSession();
  resetToLoginScreen();
}

type HandleForceLogoutOptions = {
  deferAlert?: boolean;
};

export async function handleForceLogoutRemoteMessage(
  remoteMessage?: FirebaseMessagingTypes.RemoteMessage | null,
  options: HandleForceLogoutOptions = {},
): Promise<boolean> {
  const payload = parseForceLogoutPayload(
    remoteMessage?.data as Record<string, unknown> | undefined,
    remoteMessage?.notification,
  );
  if (!payload) return false;

  const deferAlert =
    options.deferAlert ?? AppState.currentState !== 'active';

  await performForceLogout(payload);

  if (deferAlert) {
    await savePendingForceLogoutAlert(payload);
  } else {
    emitForceLogoutAlert(payload);
  }

  return true;
}

export async function handleForceLogoutData(
  data?: Record<string, unknown> | object | null,
  options: HandleForceLogoutOptions = {},
): Promise<boolean> {
  const payload = parseForceLogoutPayload(data);
  if (!payload) return false;

  const deferAlert =
    options.deferAlert ?? AppState.currentState !== 'active';

  await performForceLogout(payload);

  if (deferAlert) {
    await savePendingForceLogoutAlert(payload);
  } else {
    emitForceLogoutAlert(payload);
  }

  return true;
}
