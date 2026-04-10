import { StyleSheet } from 'react-native';
import { heightPixel, widthPixel } from '../../utils/helper';
import colors from '../../utils/colors';

const styles = StyleSheet.create({
  container: {
    gap: heightPixel(15),
  },
  topCard: {
    backgroundColor: colors.grayish_black,
    borderRadius: widthPixel(15),
    padding: widthPixel(15),
    width: '48%',
    height: heightPixel(150),
    justifyContent: 'space-between',
  },
  topCardValue: {
    fontSize: heightPixel(24),
    fontWeight: 'bold',
    color: colors.white,
  },
  graphCard: {
    backgroundColor: colors.grayish_black,
    borderRadius: widthPixel(15),
    padding: widthPixel(15),
    marginTop: heightPixel(15),
  },
  iconContainer: {
    width: heightPixel(40),
    height: heightPixel(40),
    borderRadius: heightPixel(20),
    borderWidth: 1,
    borderColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    width: widthPixel(110),
  },
  yallaCoinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPixel(5),
  },
});

export default styles;
