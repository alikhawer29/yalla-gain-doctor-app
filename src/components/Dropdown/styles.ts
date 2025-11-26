import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import { font, heightPixel, widthPixel } from '../../utils/helper';
import fonts from '../../assets/fonts';

const styles = StyleSheet.create({
  container: {
    marginVertical: heightPixel(7.5),
    width: '100%',
  },
  label: {
    marginBottom: heightPixel(10),
    marginHorizontal: widthPixel(2),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.white,
    borderRadius: heightPixel(8),
    paddingHorizontal: widthPixel(15),
    backgroundColor: colors.transparent,
  },
  error: {
    marginTop: heightPixel(4),
    marginLeft: widthPixel(15),
  },
  text: {
    fontFamily: fonts.sfpro.regular,
    fontSize: font(14),
    color: colors.white,
  },
  dropdown: {
    borderColor: colors.white,
    borderRadius: heightPixel(8),
    backgroundColor: colors.black,
  },
  placeholder: {
    fontFamily: fonts.sfpro.regular,
    color: colors.icon_gray,
  },
  modalContent: {
    backgroundColor: colors.black,
    paddingHorizontal: widthPixel(20),
  },
  modalTitle: {
    fontFamily: fonts.sfpro.semibold,
    fontSize: font(18),
    color: colors.white,
  },
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.grayish_black,
    paddingVertical: heightPixel(15),
  },
  listItemLabel: {
    fontFamily: fonts.sfpro.regular,
    fontSize: font(14),
    color: colors.white,
  },
});

export default styles;
