import { StyleSheet } from 'react-native';
import { heightPixel } from '../../../utils/helper';

const styles = StyleSheet.create({
  back_button_wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 15,
  },
  tab_wrapper: {
    marginBottom: heightPixel(20),
  },
  bottom_text_alt: {
    marginVertical: heightPixel(40),
    marginBottom: heightPixel(20),
  },
  upload_margin: {
    marginVertical: heightPixel(7.5),
  },
  profile_preview_wrap: {
    alignItems: 'center',
    marginBottom: heightPixel(8),
  },
  cert_preview_wrap: {
    marginBottom: heightPixel(8),
  },
});

export default styles;
