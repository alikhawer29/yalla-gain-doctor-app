import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Linking,
    Platform,
    ScrollView,
    TextInput,
    View,
} from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import dayjs from 'dayjs';
import images from '../../assets/images';
import Icon from '../../components/Icon';
import Image from '../../components/Image';
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
import { heightPixel } from '../../utils/helper';
import useKeyboard from '../../hooks/useKeyboard';
import {
    fileEntryToRichDisplay,
    pendingAttachmentIsImage,
} from './chatMediaHelpers';

const ChatDetail = () => {
    const {
        refs: { flatListRef },
        values: {
            name,
            image,
            user_role,
            messages,
            input,
            attachments,
            isLoading,
            isSending,
        },
        functions: {
            handleSendMessage,
            handleBack,
            onChangeInput,
            pickAttachments,
            removeAttachment,
        },
    } = useChatDetailController();

    const insets = useSafeAreaInsets();
    const headerHeight = useHeaderHeight();
    const keyboardHeight = useKeyboard();

    /** Stack header + in-screen chat header row — KAV sits below both; iOS needs this offset for correct padding. */
    const iosKeyboardOffset = headerHeight + heightPixel(52);

    const keyboardAvoidStyle =
        Platform.OS === 'android' && keyboardHeight > 0
            ? { paddingBottom: keyboardHeight }
            : undefined;

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
                        {!!item.message?.trim() && (
                            <Text size={13} line_height={18}>{item.message}</Text>
                        )}
                        {item.file?.length ? (
                            <View style={styles.message_files}>
                                {item.file.map((entry, fi) => {
                                    const parsed = fileEntryToRichDisplay(entry);
                                    if (!parsed) return null;
                                    const { url, displayUrl, label, isImage } = parsed;
                                    if (isImage && displayUrl) {
                                        return (
                                            <Touchable
                                                key={`${item.id}-f-${fi}`}
                                                style={styles.message_image_touch}
                                                onPress={() =>
                                                    Linking.openURL(displayUrl).catch(
                                                        () => { },
                                                    )
                                                }
                                            >
                                                <Image
                                                    source={{ uri: displayUrl }}
                                                    style={styles.message_image}
                                                    resize="cover"
                                                />
                                            </Touchable>
                                        );
                                    }
                                    return (
                                        <Text
                                            key={`${item.id}-f-${fi}`}
                                            size={12}
                                            color={colors.primary}
                                            underline={!!url}
                                            lines={1}
                                            onPress={
                                                url
                                                    ? () =>
                                                        Linking.openURL(
                                                            displayUrl || url,
                                                        ).catch(() => { })
                                                    : undefined
                                            }
                                        >
                                            {label}
                                        </Text>
                                    );
                                })}
                            </View>
                        ) : null}
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
        <View style={styles.input_section}>
            {attachments.length > 0 ? (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.attachment_strip}
                    contentContainerStyle={styles.attachment_strip_content}
                >
                    {attachments.map((a, idx) =>
                        pendingAttachmentIsImage(a) ? (
                            <View
                                key={`${a.uri}-${idx}`}
                                style={styles.attachment_preview_cell}
                            >
                                <View style={styles.attachment_thumb_wrap}>
                                    <Image
                                        source={{ uri: a.uri }}
                                        style={styles.attachment_thumb}
                                        resize="cover"
                                    />
                                    <View style={styles.attachment_thumb_remove}>
                                        <Icon
                                            source={images.cross}
                                            size={14}
                                            tint_color={colors.danger}
                                            onPress={() => removeAttachment(idx)}
                                        />
                                    </View>
                                </View>
                                <Text
                                    size={10}
                                    color={colors.icon_gray}
                                    lines={1}
                                    style={styles.attachment_thumb_caption}
                                >
                                    {a.name}
                                </Text>
                            </View>
                        ) : (
                            <View key={`${a.uri}-${idx}`} style={styles.attachment_chip}>
                                <Text
                                    size={12}
                                    lines={1}
                                    style={styles.attachment_chip_name}
                                >
                                    {a.name}
                                </Text>
                                <Icon
                                    source={images.cross}
                                    size={16}
                                    // tint_color={colors.icon_gray}
                                    onPress={() => removeAttachment(idx)}
                                />
                            </View>
                        ),
                    )}
                </ScrollView>
            ) : null}
            <View
                style={[
                    styles.input_container,
                    {
                        paddingVertical: heightPixel(10),
                        paddingBottom:
                            heightPixel(12) + (Platform.OS === 'ios' ? insets.bottom : 0),
                    },
                ]}
            >
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
                        <Icon
                            source={images.gallery}
                            size={20}
                            tint_color={colors.icon_gray}
                            onPress={isSending ? undefined : pickAttachments}
                        />
                    </View>
                </View>
                <Touchable
                    style={styles.send_button}
                    onPress={handleSendMessage}
                    disabled={
                        isSending || (!input.trim() && attachments.length === 0)
                    }
                >
                    {isSending ? (
                        <ActivityIndicator color={colors.white} size="small" />
                    ) : (
                        <Icon
                            source={images.send}
                            size={22}
                            tint_color={colors.white}
                        />
                    )}
                </Touchable>
            </View>
        </View>
    );

    if (isLoading) {
        return <ScreenLoader />;
    }

    return (
        <Wrapper no_padding hide_bottom_bar>
            {renderHeader()}
            <KeyboardAvoidingView
                style={[styles.container, keyboardAvoidStyle]}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={
                    Platform.OS === 'ios' ? iosKeyboardOffset : 0
                }
            >
                <FlatList
                    ref={flatListRef}
                    style={styles.list}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id.toString()}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                    contentContainerStyle={[
                        styles.messages_container,
                        styles.messages_content_grow,
                    ]}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() =>
                        flatListRef.current?.scrollToEnd({ animated: false })
                    }
                />
                {renderInput()}
            </KeyboardAvoidingView>
        </Wrapper>
    );
};

export default ChatDetail;

