import { StyleSheet } from 'react-native';
import { heightPixel, widthPixel } from '../../utils/helper';
import colors from '../../utils/colors';

const styles = StyleSheet.create({
  container: {
    gap: heightPixel(15),
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: heightPixel(12),
  },
  statCard: {
    backgroundColor: colors.grayish_black,
    borderRadius: widthPixel(15),
    padding: widthPixel(15),
    paddingBottom: 0,
    width: '48%',
    height: heightPixel(150),
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  statCardBody: {
    flex: 1,
  },
  cardGraphWrap: {
    width: '100%',
    height: heightPixel(48),
    marginTop: heightPixel(8),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cardGraph: {
    width: '100%',
    height: heightPixel(48),
    alignSelf: 'center',
  },
  topCardValue: {
    fontSize: heightPixel(24),
    fontWeight: 'bold',
    color: colors.white,
  },
  graphCard: {
    backgroundColor: colors.grayish_black,
    borderRadius: widthPixel(15),
    padding: widthPixel(10),
    marginTop: heightPixel(15),
    overflow: 'hidden',
  },
  chartWrap: {
    width: '100%',
    overflow: 'hidden',
    alignItems: 'flex-start',
  },
  chartLoaderWrap: {
    width: '100%',
    minHeight: heightPixel(220),
    justifyContent: 'center',
    alignItems: 'center',
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
    minWidth: widthPixel(128),
    width: widthPixel(128),
    flexShrink: 0,
  },
  filterDropdownText: {
    flexShrink: 0,
  },
  yallaCoinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPixel(5),
  },
});

export default styles;
