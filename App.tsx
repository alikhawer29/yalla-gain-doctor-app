import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { useEffect, useMemo } from 'react';
import { Platform, StatusBar, UIManager } from 'react-native';
import BootSplash from "react-native-bootsplash";
import { MenuProvider } from 'react-native-popup-menu';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import Toast from "react-native-toast-message";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import AppWrapper from './src/components/AppWrapper';
import DevNetworkLogger from './src/components/DevNetworkLogger';
import ForceLogoutBootstrap from './src/components/ForceLogoutBootstrap';
import ConsultationRealtimeBootstrap from './src/components/ConsultationRealtimeBootstrap';
import { ModalProvider } from './src/contexts/ModalContext';
import { ZoomVideoSdkProvider } from '@zoom/react-native-videosdk';
import AppStackNavigator from './src/navigation/AppStackNavigator';
import { persistor, store } from './src/redux/Store';
import { setupForegroundPushHandlers } from './src/services/push/pushNotifications';
import { flushPendingNotificationDeepLink } from './src/services/push/notificationDeepLink';
import colors from './src/utils/colors';
import { navigationRef } from './src/utils/navigation';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function App() {
  useEffect(() => {
    setTimeout(() => {
      BootSplash.hide();
    }, 1000)
  }, []);

  useEffect(() => {
    let teardown: (() => void) | undefined;
    setupForegroundPushHandlers().then(unsub => {
      teardown = unsub;
    });
    return () => {
      teardown?.();
    };
  }, []);

  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.transparent,
    },
  };

  const zoomSdkConfig = useMemo(
    () => ({
      domain: 'zoom.us',
      enableLog: __DEV__,
    }),
    [],
  );

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          <AppWrapper>
            <StatusBar
              barStyle="light-content"
              translucent={false}
              backgroundColor={colors.primary}
            />
            <MenuProvider>
              <ZoomVideoSdkProvider config={zoomSdkConfig}>
                <ModalProvider>
                  <ForceLogoutBootstrap />
                  <ConsultationRealtimeBootstrap />
                  <NavigationContainer
                    ref={navigationRef}
                    theme={navTheme}
                    onReady={() => {
                      flushPendingNotificationDeepLink();
                    }}
                  >
                    <AppStackNavigator />
                    <Toast />
                  </NavigationContainer>
                  {/* {__DEV__ && <DevNetworkLogger />} */}
                </ModalProvider>
              </ZoomVideoSdkProvider>
            </MenuProvider>
          </AppWrapper>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
