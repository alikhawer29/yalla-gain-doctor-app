import { connectChatSocket, getChatSocket } from './chatSocket';
import { store } from '../redux/Store';
import { userApi } from '../redux/Apis/User';

let bound = false;

function invalidateConsultationCaches(): void {
  try {
    store.dispatch(
      userApi.util.invalidateTags(['Bookings', 'Services', 'Notifications']),
    );
  } catch {
    // ignore
  }
}

function onCatalogOrAppointment(): void {
  invalidateConsultationCaches();
}

/**
 * Doctor/trainer: reuse chat Socket.IO connection to receive service/booking sync.
 */
export function startConsultationRealtimeSync(): () => void {
  try {
    const userId = store.getState().auth?.user?.id;
    const socket = connectChatSocket(userId);
    if (!socket) {
      return () => {};
    }

    if (!bound) {
      socket.on('serviceCatalogUpdated', onCatalogOrAppointment);
      socket.on('appointmentUpdated', onCatalogOrAppointment);
      socket.on('realtimeSync', (payload: { event?: string }) => {
        const event = String(payload?.event || '');
        if (
          event === 'serviceCatalogUpdated' ||
          event === 'appointmentUpdated'
        ) {
          onCatalogOrAppointment();
        }
      });
      bound = true;
    }
  } catch {
    // ignore
  }

  return () => {
    const socket = getChatSocket();
    if (socket && bound) {
      socket.off('serviceCatalogUpdated', onCatalogOrAppointment);
      socket.off('appointmentUpdated', onCatalogOrAppointment);
      bound = false;
    }
  };
}
