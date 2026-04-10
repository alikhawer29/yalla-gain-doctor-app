import { io, Socket } from 'socket.io-client';
import {
  CHAT_SOCKET_SIGNATURE,
  CHAT_SOCKET_URL,
} from '../utils/data';

let socketInstance: Socket | null = null;
let connectedUserId: string | number | null = null;

/**
 * Single shared Socket.IO client for chat (matches Node HTTPS + socket.io on port 2170).
 */
export function connectChatSocket(
  userId: string | number | undefined | null,
): Socket | null {
  if (userId == null || userId === '') {
    return socketInstance;
  }

  if (socketInstance && connectedUserId === userId) {
    if (!socketInstance.connected) {
      socketInstance.connect();
    }
    return socketInstance;
  }

  if (socketInstance && connectedUserId !== userId) {
    socketInstance.removeAllListeners();
    socketInstance.disconnect();
    socketInstance = null;
    connectedUserId = null;
  }

  connectedUserId = userId;
  socketInstance = io(CHAT_SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 12,
    reconnectionDelay: 1000,
    timeout: 20000,
  });

  socketInstance.on('connect', () => {
    socketInstance?.emit('sendUserId', {
      user_id: userId,
      signature: CHAT_SOCKET_SIGNATURE,
    });
  });

  socketInstance.on('connect_error', err => {
    if (__DEV__) {
      console.warn('[chatSocket] connect_error', err?.message ?? err);
    }
  });

  return socketInstance;
}

export function getChatSocket(): Socket | null {
  return socketInstance;
}

export function disconnectChatSocket(): void {
  if (socketInstance) {
    socketInstance.removeAllListeners();
    socketInstance.disconnect();
    socketInstance = null;
  }
  connectedUserId = null;
}
