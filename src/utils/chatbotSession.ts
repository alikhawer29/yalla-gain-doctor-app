import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TMessage } from '../interfaces';

const SESSION_DURATION_MS = 10 * 60 * 1000;

const storageKey = (userId: string | number) =>
  `chatbot_session_${userId}`;

export type StoredChatbotSession = {
  session_id: string;
  started_at: number;
  messages: StoredChatMessage[];
};

type StoredChatMessage = Omit<TMessage, 'timestamp'> & {
  timestamp: string | null;
};

const serializeMessages = (messages: TMessage[]): StoredChatMessage[] =>
  messages
    .filter(m => !m.typing)
    .map(m => ({
      ...m,
      timestamp:
        m.timestamp instanceof Date ? m.timestamp.toISOString() : null,
    }));

const deserializeMessages = (messages: StoredChatMessage[]): TMessage[] =>
  messages.map(m => ({
    ...m,
    timestamp: m.timestamp ? new Date(m.timestamp) : null,
  }));

export const isChatbotSessionActive = (startedAt: number) =>
  Date.now() - startedAt < SESSION_DURATION_MS;

export async function loadChatbotSession(
  userId: string | number,
): Promise<StoredChatbotSession | null> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredChatbotSession;
    if (
      !parsed?.session_id ||
      !parsed?.started_at ||
      !isChatbotSessionActive(parsed.started_at)
    ) {
      await AsyncStorage.removeItem(storageKey(userId));
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function saveChatbotSession(
  userId: string | number,
  session: {
    session_id: string;
    started_at: number;
    messages: TMessage[];
  },
): Promise<void> {
  try {
    const payload: StoredChatbotSession = {
      session_id: session.session_id,
      started_at: session.started_at,
      messages: serializeMessages(session.messages),
    };
    await AsyncStorage.setItem(storageKey(userId), JSON.stringify(payload));
  } catch {
    /* ignore persistence errors */
  }
}

export async function clearChatbotSession(
  userId: string | number,
): Promise<void> {
  try {
    await AsyncStorage.removeItem(storageKey(userId));
  } catch {
    /* ignore */
  }
}

export function restoreChatbotMessages(
  stored: StoredChatbotSession | null,
  initialMessage: TMessage,
): TMessage[] {
  if (!stored?.messages?.length) {
    return [initialMessage];
  }
  return deserializeMessages(stored.messages);
}
