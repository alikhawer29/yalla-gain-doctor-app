import { StyleSheet } from 'react-native';
import { heightPixel, widthPixel } from '../../utils/helper';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingHorizontal: widthPixel(20),
    alignItems: 'center',
  },
  coinImage: {
    width: widthPixel(200),
    height: heightPixel(200),
    marginTop: heightPixel(40),
  },
  title: {
    marginTop: heightPixel(30),
  },
    subtitle: {
        marginTop: heightPixel(8),
    },
    pendingLine: {
        marginTop: heightPixel(6),
    },
  coinsLine: {
    marginTop: heightPixel(20),
    textAlign: 'center',
  },
  rateBox: {
    marginTop: heightPixel(16),
  },
  converterText: {
    marginTop: heightPixel(50),
  },
  button: {
    marginTop: heightPixel(28),
    width: '100%',
  },
  buttonOutlined: {
    marginTop: heightPixel(14),
    width: '100%',
  },
});

export default styles;
