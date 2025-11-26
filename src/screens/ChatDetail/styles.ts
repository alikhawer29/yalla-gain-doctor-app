import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import { heightPixel, widthPixel } from '../../utils/helper';
import fonts from '../../assets/fonts';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header_container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: widthPixel(15),
        paddingVertical: heightPixel(15),
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
        flex: 1,
        paddingHorizontal: widthPixel(15),
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

