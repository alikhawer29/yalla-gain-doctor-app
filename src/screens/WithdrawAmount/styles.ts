import { StyleSheet } from 'react-native';
import { heightPixel, widthPixel } from '../../utils/helper';
import colors from '../../utils/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingHorizontal: widthPixel(20),
    paddingBottom: heightPixel(30),
  },
  button: {
    marginTop: heightPixel(30),
    width: '100%',
  },
  input: {
    marginBottom: heightPixel(15),
  },
});

export default styles;
