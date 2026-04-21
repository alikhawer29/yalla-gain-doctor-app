import { StyleSheet } from 'react-native';
import { heightPixel, widthPixel } from '../../utils/helper';
import colors from '../../utils/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingHorizontal: widthPixel(20),
  },
  fabArea: {
    marginTop: 12,
    marginBottom: 8,
    alignSelf: 'stretch',
  },
  addButton: {
    width: '100%',
    alignSelf: 'stretch',
  },
  button: {
    marginTop: heightPixel(28),
    width: '100%',
  },
  card: {
    backgroundColor: colors.blackish_gray,
    borderRadius: 10,
    padding: widthPixel(14),
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.white + '10',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colors.primary + '35',
  },
  payoutBox: {
    marginTop: 8,
    padding: 10,
    borderRadius: 8,
    backgroundColor: colors.black,
    borderWidth: 1,
    borderColor: colors.white + '08',
  },
});

export default styles;
