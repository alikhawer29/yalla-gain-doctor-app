import { useCallback, useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useModal } from '../../contexts/ModalContext';
import {
  consumePendingForceLogoutAlert,
  onForceLogoutAlert,
  type ForceLogoutAlert,
} from '../../services/auth/forceLogout';

const ForceLogoutBootstrap = () => {
  const { showOkModal } = useModal();

  const showForceLogoutAlert = useCallback(
    (payload: ForceLogoutAlert) => {
      showOkModal({
        type: 'warning',
        title: payload.title,
        message: payload.body,
      });
    },
    [showOkModal],
  );

  useEffect(() => {
    consumePendingForceLogoutAlert().then(pending => {
      if (pending) showForceLogoutAlert(pending);
    });

    return onForceLogoutAlert(showForceLogoutAlert);
  }, [showForceLogoutAlert]);

  useEffect(() => {
    const onAppStateChange = (nextState: AppStateStatus) => {
      if (nextState !== 'active') return;
      consumePendingForceLogoutAlert().then(pending => {
        if (pending) showForceLogoutAlert(pending);
      });
    };

    const subscription = AppState.addEventListener('change', onAppStateChange);
    return () => subscription.remove();
  }, [showForceLogoutAlert]);

  return null;
};

export default ForceLogoutBootstrap;
