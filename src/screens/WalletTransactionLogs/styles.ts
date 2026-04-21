import { StyleSheet } from 'react-native';
import { widthPixel } from '../../utils/helper';
import colors from '../../utils/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingHorizontal: widthPixel(20),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  filterBtn: {
    padding: 10,
    backgroundColor: colors.white + '10',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.white + '20',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.white + '25',
    backgroundColor: colors.blackish_gray,
  },
  chipActive: {
    backgroundColor: colors.primary + '40',
    borderColor: colors.primary,
  },
  card: {
    backgroundColor: colors.blackish_gray,
    borderRadius: 10,
    padding: widthPixel(12),
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.white + '10',
  },
  cardRow: {
    marginBottom: 6,
  },
});

export default styles;
