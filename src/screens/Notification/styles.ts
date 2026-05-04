import { StyleSheet } from 'react-native';
import { heightPixel, widthPixel } from '../../utils/helper';
import colors from '../../utils/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingHorizontal: widthPixel(20),
    // paddingTop: 10,
  },

  chipRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: widthPixel(8),
    marginBottom: 12,
  },
  /** Equal width + height; inactive = outlined, active = solid teal (see design ref). */
  chip: {
    flex: 1,
    minHeight: heightPixel(40),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.white + '25',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: heightPixel(8),
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  card: {
    backgroundColor: colors.black,
    borderWidth: 1,
    borderColor: colors.white + '20',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  title: {
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  markText: {
    textDecorationLine: 'underline',
  },
});

export default styles;
