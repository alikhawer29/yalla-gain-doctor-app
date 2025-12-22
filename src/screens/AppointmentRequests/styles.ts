import { StyleSheet } from 'react-native';
import { heightPixel, widthPixel } from '../../utils/helper';
import colors from '../../utils/colors';

const styles = StyleSheet.create({
  modal_overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal_content: {
    backgroundColor: colors.blackish_gray,
    borderTopLeftRadius: heightPixel(20),
    borderTopRightRadius: heightPixel(20),
    padding: widthPixel(20),
    paddingBottom: heightPixel(40),
  },
});

export default styles;
