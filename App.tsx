import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Modal, Platform, StatusBar, StyleSheet, TouchableOpacity, UIManager, View } from 'react-native';
import BootSplash from "react-native-bootsplash";
import { MenuProvider } from 'react-native-popup-menu';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from "react-native-toast-message";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import AppWrapper from './src/components/AppWrapper';
import { ModalProvider } from './src/contexts/ModalContext';
import AppStackNavigator from './src/navigation/AppStackNavigator';
import { persistor, store } from './src/redux/Store';
import colors from './src/utils/colors';
import { navigationRef } from './src/utils/navigation';
import NetworkLogger from 'react-native-network-logger';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function App() {
  const [showNetworkLogger, setShowNetworkLogger] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      BootSplash.hide();
    }, 1000)
  }, [])

  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.transparent,
    },
  };

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <AppWrapper>
            <StatusBar
              barStyle="light-content"
              translucent={false}
              backgroundColor={colors.primary}
            />
            <MenuProvider>
              <ModalProvider>
                <NavigationContainer ref={navigationRef} theme={navTheme}>
                  <AppStackNavigator />
                  <Toast />
                </NavigationContainer>

                <TouchableOpacity
                  style={styles.floatingButton}
                  onPress={() => setShowNetworkLogger(true)}
                >
                  <View style={styles.floatingButtonInner}>
                    <View style={styles.wifiIcon}>
                      <View style={styles.wifiBar1} />
                      <View style={styles.wifiBar2} />
                      <View style={styles.wifiBar3} />
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Network Logger Modal */}
                <Modal
                  visible={showNetworkLogger}
                  animationType="slide"
                  onRequestClose={() => setShowNetworkLogger(false)}
                >
                  <View style={styles.loggerContainer}>
                    <View style={styles.loggerHeader}>
                      <TouchableOpacity
                        onPress={() => setShowNetworkLogger(false)}
                        style={styles.closeButton}
                      >
                        <View style={styles.closeIcon}>
                          <View style={styles.closeLine1} />
                          <View style={styles.closeLine2} />
                        </View>
                      </TouchableOpacity>
                    </View>
                    <NetworkLogger theme="dark" />
                  </View>
                </Modal>

              </ModalProvider>
            </MenuProvider>
          </AppWrapper>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 9999,
  },
  floatingButtonInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  wifiIcon: {
    width: 24,
    height: 24,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  wifiBar1: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginBottom: 2,
  },
  wifiBar2: {
    width: 12,
    height: 4,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    backgroundColor: '#fff',
    marginBottom: 2,
  },
  wifiBar3: {
    width: 18,
    height: 4,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    backgroundColor: '#fff',
  },
  loggerContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  loggerHeader: {
    paddingTop: Platform.OS === 'ios' ? 50 : 10,
    paddingHorizontal: 15,
    paddingBottom: 10,
    backgroundColor: '#1a1a1a',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeLine1: {
    position: 'absolute',
    width: 20,
    height: 2,
    backgroundColor: '#fff',
    transform: [{ rotate: '45deg' }],
  },
  closeLine2: {
    position: 'absolute',
    width: 20,
    height: 2,
    backgroundColor: '#fff',
    transform: [{ rotate: '-45deg' }],
  },
});

export default App