import { StyleSheet } from 'react-native';
import { heightPixel, widthPixel } from '../../utils/helper';
import colors from '../../utils/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingHorizontal: widthPixel(20),
    // paddingTop: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: heightPixel(12),
  },
  summaryCard: {
    backgroundColor: colors.blackish_gray,
    borderRadius: widthPixel(12),
    padding: widthPixel(14),
    marginBottom: heightPixel(16),
    borderWidth: 1,
    borderColor: colors.white + '10',
  },
  summaryStat: {
    gap: heightPixel(6),
  },
  summaryStatMain: {
    marginBottom: heightPixel(4),
  },
  summaryValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPixel(6),
    flexWrap: 'wrap',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.white + '12',
    marginVertical: heightPixel(12),
  },
  summarySubRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  summaryHalf: {
    flex: 1,
  },
  summaryVerticalDivider: {
    width: 1,
    backgroundColor: colors.white + '12',
    marginHorizontal: widthPixel(12),
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: heightPixel(16),
  },
  filterBtn: {
    padding: 10,
    backgroundColor: colors.white + '10',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.white + '20',
  },
  card: {
    backgroundColor: colors.blackish_gray,
    borderRadius: 10,
    padding: widthPixel(10),
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.white + '10',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardItem: {
    flex: 1,
  },
  coinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
});

export default styles;
