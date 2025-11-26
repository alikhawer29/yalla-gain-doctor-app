import { StyleSheet } from 'react-native';
import { heightPixel, widthPixel } from '../../utils/helper';
import colors from '../../utils/colors';

const styles = StyleSheet.create({
  image: {
    height: heightPixel(189),
    borderRadius: heightPixel(10),
    marginBottom: heightPixel(15),
  },
  half_width_box: {
    width: '50%',
  },
  full_width_box: {
    width: '100%',
  },
  section_title: {
    marginBottom: heightPixel(20),
    marginTop: heightPixel(10),
  },
  label_text: {
    fontWeight: '600',
  },
  value_text: {
    color: colors.icon_gray,
  },
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
