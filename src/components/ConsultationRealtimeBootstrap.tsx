import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { startConsultationRealtimeSync } from '../services/consultationRealtime';
import { selectLoggedIn } from '../redux/Slices/AuthSlice';

/** Connects Socket.IO consultation sync for doctor/trainer while logged in. */
export default function ConsultationRealtimeBootstrap() {
  const isLoggedIn = useSelector(selectLoggedIn);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }
    return startConsultationRealtimeSync();
  }, [isLoggedIn]);

  return null;
}
