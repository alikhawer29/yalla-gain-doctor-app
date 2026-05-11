import { StyleSheet } from 'react-native';
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
    width: widthPixel(100),
    minWidth: widthPixel(88),
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
});

export default styles;
