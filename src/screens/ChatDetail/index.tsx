import React, { useCallback, useEffect } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    TextInput,
    View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    chatMessageLocalDayKey,
    formatChatDateSeparatorLocal,
    formatChatTimeLocal,
} from '../../utils/chatTime';
import images from '../../assets/images';
import Icon from '../../components/Icon';
import Image from '../../components/Image';
import Row from '../../components/Row';
import Text from '../../components/Text';
import Wrapper from '../../components/Wrapper';
import Badge from '../../components/Badge';
import Touchable from '../../components/Touchable';
import colors from '../../utils/colors';
import { IChatMessage } from '../../interfaces';
import useChatDetailController from './useChatDetailController';
import styles from './styles';
import { heightPixel } from '../../utils/helper';
import useKeyboard from '../../hooks/useKeyboard';
import { downloadChatDocument } from '../../utils/chatFileDownload';
import { fileEntryToRichDisplay } from './chatMediaHelpers';

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
            isMessagesInitialLoading,
            isSending,
            imageViewerUri,
        },
        functions: {
            handleSendMessage,
            handleBack,
            onChangeInput,
            pickAttachments,
            removeAttachment,
            openImageViewer,
            closeImageViewer,
        },
    } = useChatDetailController();

    const scrollToLatest = useCallback(() => {
        if (messages.length === 0) return;
        requestAnimationFrame(() => {
            flatListRef.current?.scrollToEnd({ animated: false });
        });
    }, [messages.length]);

    /** Screen open / back: list may not have measured height yet — stagger scrolls. */
    useFocusEffect(
        useCallback(() => {
            scrollToLatest();
            const t = setTimeout(scrollToLatest, 120);
            const t2 = setTimeout(scrollToLatest, 350);
            return () => {
                clearTimeout(t);
                clearTimeout(t2);
            };
        }, [scrollToLatest]),
    );

    /** First paint + new messages: retry after layout (avoids relying on onContentSizeChange, which also fires when images load). */
    useEffect(() => {
        if (messages.length === 0) return;
        scrollToLatest();
        const t = setTimeout(scrollToLatest, 80);
        const t2 = setTimeout(scrollToLatest, 280);
        return () => {
            clearTimeout(t);
            clearTimeout(t2);
        };
    }, [messages.length, scrollToLatest]);

    const insets = useSafeAreaInsets();
    const headerHeight = useHeaderHeight();
    const keyboardHeight = useKeyboard();

    /** Stack header + in-screen chat header row — KAV sits below both; iOS needs this offset for correct padding. */
    // const iosKeyboardOffset = headerHeight + heightPixel(52);
    const iosKeyboardOffset = headerHeight;


    const keyboardAvoidStyle =
        Platform.OS === 'android' && keyboardHeight > 0
            ? { paddingBottom: keyboardHeight }
            : undefined;

    const renderHeader = () => (
        <View style={styles.header_container}>
            {/* <Icon
                source={images.back}
                size={40}
                rounded
                border={colors.white}
                onPress={handleBack}
            /> */}
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

    const renderDateSeparator = (date: string, time: string) => (
        <View style={styles.date_separator}>
            <Text size={12} color={colors.icon_gray}>
                {formatChatDateSeparatorLocal(date, time, date)}
            </Text>
        </View>
    );

    const renderMessage = ({ item, index }: { item: IChatMessage; index: number }) => {
        const isMine = item.is_mine;
        const prev = index > 0 ? messages[index - 1] : null;
        const showDate =
            index === 0 ||
            chatMessageLocalDayKey(prev?.date, prev?.time) !==
                chatMessageLocalDayKey(item.date, item.time);

        return (
            <View>
                {showDate && renderDateSeparator(item.date, item.time)}
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
                                                onPress={() => openImageViewer(displayUrl)}
                                            >
                                                <Image
                                                    source={{ uri: displayUrl }}
                                                    style={styles.message_image}
                                                    resize="cover"
                                                />
                                                <Text
                                                    size={10}
                                                    color={colors.icon_gray}
                                                    style={styles.message_image_hint}
                                                >
                                                    Tap to view
                                                </Text>
                                            </Touchable>
                                        );
                                    }
                                    return (
                                        <Touchable
                                            key={`${item.id}-f-${fi}`}
                                            onPress={
                                                url
                                                    ? () =>
                                                        downloadChatDocument(
                                                            url,
                                                            label,
                                                        )
                                                    : undefined
                                            }
                                            disabled={!url}
                                        >
                                            <Text
                                                size={12}
                                                color={colors.primary}
                                                underline={!!url}
                                                lines={2}
                                            >
                                                {label}
                                                {url ? '\nTap to download' : ''}
                                            </Text>
                                        </Touchable>
                                    );
                                })}
                            </View>
                        ) : null}
                        <Row style={styles.message_time} justify={isMine ? 'flex-start' : 'flex-end'}>
                            <Icon source={images.clock} size={10} tint_color={colors.icon_gray} />
                            <Text size={10} color={colors.icon_gray}>
                                {formatChatTimeLocal(item.date, item.time, item.time)}
                            </Text>
                        </Row>
                    </View>
                </View>
            </View>
        );
    };

    const renderInput = () => (
        <View style={styles.input_section}>
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
                    {attachments.length > 0 ? (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.input_inline_attachments}
                            contentContainerStyle={styles.input_inline_attachments_content}
                        >
                            {attachments.map((a, idx) => (
                                <View
                                    key={`${a.uri}-${idx}`}
                                    style={styles.input_inline_thumb_wrap}
                                >
                                    <Image
                                        source={{ uri: a.uri }}
                                        style={styles.input_inline_thumb}
                                        resize="cover"
                                    />
                                    <Pressable
                                        style={styles.input_inline_thumb_remove}
                                        onPress={() => removeAttachment(idx)}
                                    >
                                        <Icon
                                            source={images.cross}
                                            size={12}
                                            tint_color={colors.danger}
                                        />
                                    </Pressable>
                                </View>
                            ))}
                        </ScrollView>
                    ) : null}
                    <View style={styles.input_row}>
                        <TextInput
                            style={styles.input}
                            placeholder="Type message ..."
                            placeholderTextColor={colors.icon_gray}
                            value={input}
                            onChangeText={onChangeInput}
                            multiline
                            scrollEnabled
                            textAlignVertical="top"
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

    return (
        <Wrapper no_padding hide_bottom_bar>
            <Modal
                visible={!!imageViewerUri}
                transparent
                animationType="fade"
                onRequestClose={closeImageViewer}
            >
                <Pressable
                    style={styles.image_viewer_backdrop}
                    onPress={closeImageViewer}
                >
                    <View style={styles.image_viewer_content} pointerEvents="none">
                        <Image
                            source={{ uri: imageViewerUri ?? '' }}
                            style={styles.image_viewer_image}
                            resize="contain"
                        />
                        <Text
                            size={14}
                            color={colors.white}
                            style={styles.image_viewer_hint}
                        >
                            Tap to close
                        </Text>
                    </View>
                </Pressable>
            </Modal>
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
                    ListEmptyComponent={
                        isMessagesInitialLoading ? (
                            <View
                                style={{
                                    flexGrow: 1,
                                    minHeight: heightPixel(200),
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <ActivityIndicator
                                    color={colors.primary}
                                    size="small"
                                />
                            </View>
                        ) : (
                            <View
                                style={{
                                    flexGrow: 1,
                                    minHeight: heightPixel(120),
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <Text size={14} color={colors.icon_gray}>
                                    No messages yet
                                </Text>
                            </View>
                        )
                    }
                />
                {renderInput()}
            </KeyboardAvoidingView>
        </Wrapper>
    );
};

export default ChatDetail;

