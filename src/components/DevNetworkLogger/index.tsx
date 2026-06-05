import { useState } from 'react';
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import NetworkLogger from 'react-native-network-logger';
import colors from '../../utils/colors';

/** Flip to `true` when you need in-app API logs — no comment/uncomment elsewhere. */
const ENABLE_NETWORK_LOGGER = true;

const DevNetworkLogger = () => {
  const [visible, setVisible] = useState(false);

  if (!ENABLE_NETWORK_LOGGER) {
    return null;
  }

  return (
    <>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setVisible(true)}
        accessibilityLabel="Open network logger"
      >
        <Text style={styles.fabText}>API</Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>
          <NetworkLogger theme="dark" />
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 5,
  },
  fabText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 10,
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  close: {
    color: '#fff',
    fontSize: 22,
  },
});

export default DevNetworkLogger;
