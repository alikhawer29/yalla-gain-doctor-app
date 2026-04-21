import { StyleSheet } from 'react-native';
import { widthPixel } from '../../utils/helper';
import colors from '../../utils/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: widthPixel(20),
  },
  summary: {
    backgroundColor: colors.blackish_gray,
    borderRadius: 10,
    padding: widthPixel(14),
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.white + '10',
  },
  button: {
    marginTop: 20,
  },
});

export default styles;
