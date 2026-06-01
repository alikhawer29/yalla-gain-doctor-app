import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import { heightPixel, widthPixel } from '../../utils/helper';

const styles = StyleSheet.create({
  avatar: {
    width: '100%',
    height: heightPixel(260),
  },
  smallButton: {
    height: heightPixel(25),
    width: '47%',
    minWidth: 0,
    paddingHorizontal: 0,
  },
  chartSection: {
    marginTop: heightPixel(30),
    gap: heightPixel(15),
  },
  chartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: heightPixel(10),
    flexWrap: 'wrap',
  },
  yearDropdown: {
    width: widthPixel(128),
    minWidth: widthPixel(128),
    flexShrink: 0,
  },
  caloriesDropdown: {
    width: widthPixel(120),
  },
  caloriesChartWrap: {
    marginLeft: -widthPixel(20),
  },
  stepsMiniGraph: {
    width: widthPixel(70),
    height: heightPixel(40),
  },
  rowGap: {
    gap: heightPixel(10),
  },
  caloriesRow: {
    marginTop: heightPixel(20),
    gap: heightPixel(15),
  },
  caloriesHeader: {
    marginBottom: heightPixel(20),
  },
  centerMsg: {
    paddingVertical: heightPixel(24),
    alignItems: 'center',
  },
  bmiChartWrap: {
    width: '100%',
    overflow: 'hidden',
    alignItems: 'flex-start',
    backgroundColor: colors.blackish_gray,
    borderRadius: widthPixel(12),
  },
  bmiChartEmpty: {
    minHeight: heightPixel(220),
    borderRadius: widthPixel(12),
    backgroundColor: colors.blackish_gray,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: widthPixel(16),
  },
  chartLoaderWrap: {
    width: '100%',
    minHeight: heightPixel(220),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.blackish_gray,
    borderRadius: widthPixel(12),
  },
});

export default styles;
