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
    marginBottom: 20,
  },
  filterBtn: {
    padding: 10,
    backgroundColor: colors.white + '10',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.white + '20',
  },
  card: {
    backgroundColor: colors.white + '05',
    borderRadius: 20,
    padding: 15,
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
