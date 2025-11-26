import { StyleSheet } from 'react-native';
import { heightPixel, widthPixel } from '../../utils/helper';

const SPACING = 15;

const styles = StyleSheet.create({
  list_header: {
    marginBottom: heightPixel(SPACING),
  },
  header_container: {
    gap: heightPixel(SPACING),
    zIndex: 1000,
    marginBottom: heightPixel(SPACING),
  },
  filter_container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPixel(10),
    zIndex: 1000,
  },
  filter_label: {
    marginRight: widthPixel(5),
  },
  dropdown_container: {
    width: widthPixel(100),
    zIndex: 1000,
  },
  search_container: {
    flex: 1,
  },
  empty_container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: heightPixel(100),
  },
  list_content: {
    paddingTop: heightPixel(5),
  },
});

export default styles;
