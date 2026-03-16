import React from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    TextInput,
    View,
} from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import dayjs from 'dayjs';
import images from '../../assets/images';
import Icon from '../../components/Icon';
import Row from '../../components/Row';
import Text from '../../components/Text';
import Wrapper from '../../components/Wrapper';
import Badge from '../../components/Badge';
import Touchable from '../../components/Touchable';
import ScreenLoader from '../../components/ScreenLoader';
import colors from '../../utils/colors';
import { IChatMessage } from '../../interfaces';
import useChatDetailController from './useChatDetailController';
import styles from './styles';
import useKeyboard from '../../hooks/useKeyboard';
import { heightPixel } from '../../utils/helper';

const ChatDetail = () => {
    const {
        refs: { flatListRef },
        values: { name, image, user_role, messages, input, isLoading, isSending },
        functions: { handleSendMessage, handleBack, onChangeInput },
    } = useChatDetailController();

    const keyboardHeight = useKeyboard();
    const isNewAndroid = Platform.OS === 'android' && Platform.Version >= 35;
    const headerHeight = useHeaderHeight();
    const insets = useSafeAreaInsets();

    const renderHeader = () => (
        <View style={styles.header_container}>
            <Icon
                source={images.back}
                size={40}
                rounded
                border={colors.white}
                onPress={handleBack}
            />
            <View style={styles.header_info}>
                <Icon source={{ uri: image }} size={40} rounded no_padding />
                <Text weight="semibold" size={16}>{name}</Text>
            </View>
            <Badge
                title={user_role === 'admin' ? 'Admin' : 'User'}
                color={user_role === 'admin' ? colors.primary : colors.grayish_black}
                style={styles.header_badge}
            />
        </View>
    );

    const renderDateSeparator = (date: string) => (
        <View style={styles.date_separator}>
            <Text size={12} color={colors.icon_gray}>
                {dayjs(date).format('MMMM DD, YYYY')}
            </Text>
        </View>
    );

    const renderMessage = ({ item, index }: { item: IChatMessage; index: number }) => {
        const isMine = item.is_mine;
        const showDate = index === 0 || messages[index - 1]?.date !== item.date;

        return (
            <View>
                {showDate && renderDateSeparator(item.date)}
                <View
                    style={[
                        styles.message_container,
                        isMine ? styles.my_message_container : styles.other_message_container,
                    ]}
                >
                    <View style={styles.avatar_container}>
                        <Icon source={{ uri: item.image }} size={32} rounded no_padding />
                    </View>
                    <View
                        style={[
                            styles.message_bubble,
                            isMine ? styles.my_message_bubble : styles.other_message_bubble,
                        ]}
                    >
                        <Text size={13} line_height={18}>{item.message}</Text>
                        <Row style={styles.message_time} justify={isMine ? 'flex-start' : 'flex-end'}>
                            <Icon source={images.clock} size={10} tint_color={colors.icon_gray} />
                            <Text size={10} color={colors.icon_gray}>{item.time}</Text>
                        </Row>
                    </View>
                </View>
            </View>
        );
    };

    const renderInput = () => (
        <View style={[styles.input_container, {
            paddingVertical: heightPixel(10),
            paddingBottom:
              Platform.OS === 'ios'
                ? heightPixel(0)
                : (keyboardHeight ? heightPixel(80) : heightPixel(30)) + insets.bottom,
          }]}>
            <View style={styles.input_wrapper}>
                <TextInput
                    style={styles.input}
                    placeholder="Type message ..."
                    placeholderTextColor={colors.icon_gray}
                    value={input}
                    onChangeText={onChangeInput}
                    multiline={false}
                />
                <View style={styles.input_icons}>
                    <Icon source={images.gallery} size={20} tint_color={colors.icon_gray} />
                </View>
            </View>
            <Touchable
                style={styles.send_button}
                onPress={handleSendMessage}
                disabled={isSending || !input.trim()}
            >
                <Icon source={images.send} size={22} tint_color={colors.white} />
            </Touchable>
        </View>
    );

    if (isLoading) {
        return <ScreenLoader />;
    }

    return (
        <Wrapper no_padding hide_bottom_bar>
            {renderHeader()}
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight + insets.top : 0}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={[
                        styles.messages_container,
                        { paddingBottom: isNewAndroid ? keyboardHeight : 0 },
                    ]}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                />
                {renderInput()}
            </KeyboardAvoidingView>
        </Wrapper>
    );
};

export default ChatDetail;

