import { CommonActions } from '@react-navigation/native';
import { store } from '../../redux/Store';
import { NAVIGATORS, ROUTES } from '../../utils/routes';
import { navigationRef } from '../../utils/navigation';

export type NotificationDeepLinkData = Record<string, unknown>;

let pendingDeepLink: NotificationDeepLinkData | null = null;
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function asString(value: unknown): string | null {
  if (value == null) return null;
  const s = String(value).trim();
  return s.length > 0 ? s : null;
}

function asPositiveId(value: unknown): number | null {
  const raw = asString(value);
  if (!raw || raw === '0') return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function resolveEventType(data: NotificationDeepLinkData): string {
  return (
    asString(data.type) ||
    asString(data.notification_type) ||
    asString(data.event_type) ||
    'general'
  ).toLowerCase();
}

function resolveTargetType(data: NotificationDeepLinkData): string | null {
  const explicit = asString(data.target_type)?.toLowerCase();
  if (explicit) return explicit;

  const eventType = resolveEventType(data);
  if (eventType.startsWith('subscription')) return 'subscription_log';
  if (
    eventType.includes('appointment') ||
    eventType.includes('booking') ||
    eventType.includes('session') ||
    eventType.includes('escrow')
  ) {
    return 'appointment';
  }
  if (eventType.includes('chat') || eventType === 'message') return 'chat';
  if (eventType.includes('coin') || eventType.includes('wallet') || eventType.includes('payout') || eventType.includes('transfer')) {
    return 'wallet';
  }
  if (eventType.includes('feedback')) return 'feedback';
  if (eventType.includes('account')) return 'user';
  return null;
}

function resolveTargetId(data: NotificationDeepLinkData): number | null {
  return (
    asPositiveId(data.target_id) ||
    asPositiveId(data.content_id) ||
    asPositiveId(data.appointment_id) ||
    asPositiveId(data.chat_id) ||
    asPositiveId(data.id)
  );
}

function drawerNavigate(screen: string, params?: object): void {
  if (!navigationRef.isReady()) return;
  navigationRef.dispatch(
    CommonActions.navigate({
      name: NAVIGATORS.DRAWER as never,
      params: {
        screen,
        params,
      },
    } as never),
  );
}

function openNotificationInbox(): void {
  if (!navigationRef.isReady()) return;
  navigationRef.dispatch(
    CommonActions.navigate({
      name: ROUTES.NOTIFICATION as never,
    } as never),
  );
}

/**
 * Navigate doctor/trainer app to the screen for this notification payload.
 * Never throws.
 */
export function navigateFromNotificationData(
  data?: NotificationDeepLinkData | null,
): void {
  try {
    if (!data || typeof data !== 'object') {
      openNotificationInbox();
      return;
    }

    const eventType = resolveEventType(data);
    if (eventType === 'force_logout') {
      return;
    }

    const targetType = resolveTargetType(data);
    const targetId = resolveTargetId(data);

    switch (targetType) {
      case 'appointment':
        if (eventType.includes('request') && !targetId) {
          drawerNavigate(NAVIGATORS.BOOKING_STACK, {
            screen: ROUTES.APPOINTMENT_REQUESTS,
          });
          return;
        }
        if (targetId) {
          drawerNavigate(NAVIGATORS.BOOKING_STACK, {
            screen: ROUTES.BOOKING_DETAILS,
            params: { id: targetId },
          });
          return;
        }
        drawerNavigate(NAVIGATORS.BOOKING_STACK, {
          screen: ROUTES.SERVICE_LOGS,
        });
        return;

      case 'chat':
        if (targetId) {
          drawerNavigate(NAVIGATORS.BOTTOM, {
            screen: NAVIGATORS.CHAT_STACK,
            params: {
              screen: ROUTES.CHAT_DETAIL,
              params: {
                chatId: targetId,
                name: asString(data.sender_name) || asString(data.title) || 'Chat',
                image: asString(data.image) || asString(data.sender_image) || '',
                user_role:
                  (asString(data.user_role) as 'admin' | 'user' | null) ||
                  (asString(data.sender_role) as 'admin' | 'user' | null) ||
                  'user',
              },
            },
          });
          return;
        }
        drawerNavigate(NAVIGATORS.BOTTOM, {
          screen: NAVIGATORS.CHAT_STACK,
          params: { screen: ROUTES.CHAT },
        });
        return;

      case 'subscription_log':
      case 'subscription':
        drawerNavigate(NAVIGATORS.SUBSCRIPTION_STACK, {
          screen: ROUTES.SUBSCRIPTION_LOGS,
        });
        return;

      case 'wallet':
      case 'coin_transfer_log':
        drawerNavigate(NAVIGATORS.WALLET_STACK, {
          screen: ROUTES.WALLET,
        });
        return;

      case 'feedback':
        drawerNavigate(NAVIGATORS.HELP_DESK_STACK, {
          screen: ROUTES.CONTACT_US,
        });
        return;

      case 'user':
      case 'account_status':
        drawerNavigate(NAVIGATORS.BOTTOM, {
          screen: NAVIGATORS.MY_PROFILE_STACK,
          params: { screen: ROUTES.MY_PROFILE },
        });
        return;

      default:
        openNotificationInbox();
    }
  } catch {
    try {
      openNotificationInbox();
    } catch {
      // never crash
    }
  }
}

function canNavigateNow(): boolean {
  try {
    return (
      navigationRef.isReady() &&
      Boolean(store.getState().auth?.isLoggedIn)
    );
  } catch {
    return false;
  }
}

export function handleNotificationOpen(
  data?: NotificationDeepLinkData | null,
): void {
  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    return;
  }
  if (resolveEventType(data) === 'force_logout') {
    return;
  }

  if (canNavigateNow()) {
    pendingDeepLink = null;
    navigateFromNotificationData(data);
    return;
  }

  pendingDeepLink = data;
  scheduleFlushPendingDeepLink();
}

export function flushPendingNotificationDeepLink(): void {
  if (!pendingDeepLink) return;
  if (!canNavigateNow()) {
    scheduleFlushPendingDeepLink();
    return;
  }
  const payload = pendingDeepLink;
  pendingDeepLink = null;
  navigateFromNotificationData(payload);
}

function scheduleFlushPendingDeepLink(): void {
  if (flushTimer) return;
  let attempts = 0;
  const tick = () => {
    flushTimer = null;
    attempts += 1;
    if (pendingDeepLink && canNavigateNow()) {
      flushPendingNotificationDeepLink();
      return;
    }
    if (pendingDeepLink && attempts < 40) {
      flushTimer = setTimeout(tick, 250);
    }
  };
  flushTimer = setTimeout(tick, 250);
}

export function normalizeNotificationData(
  data?: Record<string, unknown> | object | null,
): NotificationDeepLinkData {
  if (!data || typeof data !== 'object') return {};
  const out: NotificationDeepLinkData = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (value === undefined || value === null) continue;
    out[key] = value;
  }
  return out;
}
