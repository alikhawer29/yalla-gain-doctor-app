import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import { heightPixel, widthPixel } from '../../utils/helper';
import fonts from '../../assets/fonts';

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
  attachment_strip: {
    maxHeight: heightPixel(130),
    paddingHorizontal: widthPixel(15),
    paddingBottom: heightPixel(8),
    flexGrow: 0,
  },
  attachment_strip_content: {
    alignItems: 'flex-end',
    paddingRight: widthPixel(15),
    paddingTop: heightPixel(4),
  },
  attachment_preview_cell: {
    marginRight: widthPixel(12),
    alignItems: 'center',
    maxWidth: widthPixel(100),
  },
  attachment_thumb_wrap: {
    position: 'relative',
    width: heightPixel(72),
    height: heightPixel(72),
    borderRadius: heightPixel(10),
    overflow: 'hidden',
    backgroundColor: colors.blackish_gray,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  attachment_thumb: {
    width: '100%',
    height: '100%',
  },
  attachment_thumb_remove: {
    position: 'absolute',
    top: heightPixel(4),
    right: heightPixel(4),
    zIndex: 2,
    // backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: heightPixel(12),
  },
  attachment_thumb_caption: {
    marginTop: heightPixel(4),
    maxWidth: widthPixel(96),
  },
  attachment_chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPixel(6),
    paddingHorizontal: widthPixel(10),
    paddingVertical: heightPixel(6),
    marginRight: widthPixel(8),
    backgroundColor: colors.blackish_gray,
    borderRadius: heightPixel(8),
    borderWidth: 1,
    borderColor: colors.primary,
    maxWidth: widthPixel(200),
  },
  attachment_chip_name: {
    flexShrink: 1,
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
  input_container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: widthPixel(15),
    paddingVertical: heightPixel(15),
    gap: widthPixel(10),
  },
  input_wrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.blackish_gray,
    borderRadius: heightPixel(10),
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: widthPixel(15),
  },
  input: {
    flex: 1,
    height: heightPixel(50),
    color: colors.white,
    fontFamily: fonts.sfpro.regular,
  },
  input_icons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPixel(10),
  },
  send_button: {
    width: heightPixel(50),
    height: heightPixel(50),
    borderRadius: heightPixel(25),
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar_container: {
    width: heightPixel(39),
    alignItems: 'center',
  },
});

export default styles;
