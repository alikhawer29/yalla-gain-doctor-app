import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import { heightPixel, widthPixel } from '../../utils/helper';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  messages_content_grow: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  header_container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: widthPixel(15),
    flexShrink: 0,
    gap: widthPixel(12),
  },
  header_info: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPixel(10),
  },
  header_badge: {
    paddingHorizontal: widthPixel(12),
    paddingVertical: heightPixel(4),
    borderRadius: heightPixel(12),
  },
  messages_container: {
    paddingHorizontal: widthPixel(15),
    paddingVertical: heightPixel(8),
  },
  date_separator: {
    alignItems: 'center',
    marginVertical: heightPixel(15),
  },
  message_container: {
    flexDirection: 'row',
    marginVertical: heightPixel(8),
    maxWidth: '85%',
  },
  my_message_container: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  other_message_container: {
    alignSelf: 'flex-start',
  },
  message_bubble: {
    borderRadius: heightPixel(12),
    padding: heightPixel(12),
    marginHorizontal: widthPixel(8),
    maxWidth: '85%',
  },
  my_message_bubble: {
    backgroundColor: colors.grayish_black,
    borderTopRightRadius: 0,
  },
  other_message_bubble: {
    backgroundColor: colors.blackish_gray,
    borderTopLeftRadius: 0,
  },
  message_time: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPixel(4),
    marginTop: heightPixel(6),
  },
  input_section: {
    flexShrink: 0,
    // paddingHorizontal: widthPixel(50),
    paddingVertical: heightPixel(20),
  },
  input_inline_attachments: {
    maxHeight: heightPixel(56),
    marginBottom: heightPixel(8),
  },
  input_inline_attachments_content: {
    alignItems: 'center',
    gap: widthPixel(8),
  },
  input_inline_thumb_wrap: {
    position: 'relative',
    width: heightPixel(48),
    height: heightPixel(48),
    borderRadius: heightPixel(8),
    overflow: 'hidden',
    backgroundColor: colors.black,
  },
  input_inline_thumb: {
    width: '100%',
    height: '100%',
  },
  input_inline_thumb_remove: {
    position: 'absolute',
    top: heightPixel(2),
    right: heightPixel(2),
    zIndex: 2,
  },
  input_row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '100%',
  },
  message_files: {
    marginTop: heightPixel(6),
    gap: heightPixel(8),
    alignSelf: 'stretch',
  },
  message_image_touch: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  message_image: {
    width: widthPixel(200),
    maxWidth: '100%',
    height: heightPixel(180),
    borderRadius: heightPixel(10),
    backgroundColor: colors.blackish_gray,
  },
  message_image_hint: {
    marginTop: heightPixel(4),
  },
  image_viewer_backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
  },
  image_viewer_content: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: widthPixel(16),
  },
  image_viewer_image: {
    width: '100%',
    height: '80%',
  },
  image_viewer_hint: {
    marginTop: heightPixel(16),
    textAlign: 'center',
  },
  input_container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: widthPixel(15),
    paddingVertical: heightPixel(15),
    gap: widthPixel(10),
  },
  input_wrapper: {
    flex: 1,
    backgroundColor: colors.blackish_gray,
    borderRadius: heightPixel(10),
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: widthPixel(12),
    paddingVertical: heightPixel(8),
  },
  input: {
    flex: 1,
    minHeight: heightPixel(40),
    maxHeight: heightPixel(100),
    color: colors.white,
    paddingTop: heightPixel(8),
    paddingBottom: heightPixel(8),
  },
  input_icons: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: heightPixel(8),
    gap: widthPixel(10),
  },
  send_button: {
    width: heightPixel(50),
    height: heightPixel(50),
    borderRadius: heightPixel(25),
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginBottom: heightPixel(2),
  },
  avatar_container: {
    width: heightPixel(39),
    alignItems: 'center',
  },
});

export default styles;
