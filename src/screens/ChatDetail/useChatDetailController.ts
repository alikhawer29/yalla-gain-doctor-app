import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { pick, types as DocumentTypes } from '@react-native-documents/picker';
import { useSelector } from 'react-redux';
import { useGetChatQuery, useSendMessageMutation } from '../../redux/Apis/Chat';
import { RootStackParamList, IChatMessage } from '../../interfaces';
import { chatApi } from '../../redux/Apis/Chat';
import { useDispatch } from 'react-redux';
import { RootState } from '../../redux/Store';
import { connectChatSocket } from '../../services/chatSocket';

export type ChatAttachment = {
    uri: string;
    name: string;
    type: string;
};

const sameChat = (a: number, b: number) => Number(a) === Number(b);

/**
 * Socket/API sometimes send wrong `is_mine` (e.g. sender-relative). Align with current user.
 */
function normalizeMessageMine(
    msg: IChatMessage,
    currentUserId: string | number | undefined | null,
): IChatMessage {
    if (currentUserId == null || msg.user_id == null) {
        return msg;
    }
    const mine = Number(msg.user_id) === Number(currentUserId);
    return { ...msg, is_mine: mine };
}

type ChatDetailRouteProp = RouteProp<RootStackParamList, 'ChatDetail'>;

const useChatDetailController = () => {
    const route = useRoute<ChatDetailRouteProp>();
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { chatId, name, image, user_role } = route.params;

    const authUser = useSelector((state: RootState) => state.auth.user);
    const authUserId =
        authUser?.id ?? authUser?.user_id ?? authUser?.user?.id;

    const flatListRef = useRef<FlatList>(null);

    const [input, setInput] = useState('');
    const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
    const [messages, setMessages] = useState<IChatMessage[]>([]);

    const { data: chatData, isLoading, refetch } = useGetChatQuery(chatId);
    const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();

    // Initialize messages from API (re-apply is_mine using logged-in user)
    useEffect(() => {
        if (chatData?.data) {
            setMessages(
                chatData.data.map((m: IChatMessage) =>
                    normalizeMessageMine(m, authUserId),
                ),
            );
        }
    }, [chatData, authUserId]);

    // Shared Socket.IO (HTTPS :2170); server emits `io.emit(String(chat_id), data)` + `receiveMessage`
    useEffect(() => {
        if (authUserId == null) return;

        const socket = connectChatSocket(authUserId);
        if (!socket) return;

        const roomEvent = String(chatId);

        const onRoomMessage = (data: IChatMessage) => {
            if (!sameChat(data.chat_id, chatId)) return;
            const row = normalizeMessageMine(data, authUserId);
            setMessages(prev => {
                if (prev.some(msg => msg.id === row.id)) return prev;
                return [...prev, row];
            });
            scrollToEnd();
        };

        const onReceiveMessage = (data: IChatMessage) => {
            if (!sameChat(data.chat_id, chatId)) return;
            const row = normalizeMessageMine(data, authUserId);
            setMessages(prev => {
                if (prev.some(msg => msg.id === row.id)) return prev;
                return [...prev, row];
            });
            scrollToEnd();
        };

        socket.on(roomEvent, onRoomMessage);
        socket.on('receiveMessage', onReceiveMessage);

        return () => {
            socket.off(roomEvent, onRoomMessage);
            socket.off('receiveMessage', onReceiveMessage);
        };
    }, [chatId, authUserId]);

    const scrollToEnd = useCallback(() => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, []);

    const pickAttachments = useCallback(async () => {
        try {
            const res = await pick({
                allowMultiSelection: true,
                type: [
                    DocumentTypes.images,
                    DocumentTypes.pdf,
                    DocumentTypes.plainText,
                    DocumentTypes.doc,
                    DocumentTypes.docx,
                ],
            });
            if (!res?.length) return;
            const next: ChatAttachment[] = res.map((file) => ({
                uri: file.uri,
                name: file.name ?? 'file',
                type: file.type ?? 'application/octet-stream',
            }));
            setAttachments((prev) => [...prev, ...next]);
        } catch {
            /* user cancelled or picker error */
        }
    }, []);

    const removeAttachment = useCallback((index: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const handleSendMessage = useCallback(async () => {
        const text = input.trim();
        if (!text && attachments.length === 0) return;

        const filesPayload = attachments.map((a) => ({ ...a }));
        const messageForApi =
            text || (filesPayload.length > 0 ? ' ' : '');

        try {
            const result = await sendMessage({
                chat_id: chatId,
                message: messageForApi,
                files: filesPayload.length > 0 ? filesPayload : undefined,
            }).unwrap();

            setInput('');
            setAttachments([]);

            const socket = connectChatSocket(authUserId);
            const payload = result?.data ?? result;
            if (socket && payload) {
                socket.emit('sendMessage', payload);
            }

            dispatch(chatApi.util.invalidateTags(['ChatList']));

            scrollToEnd();
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    }, [input, attachments, chatId, authUserId, sendMessage, dispatch, scrollToEnd]);

    const handleBack = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const onChangeInput = useCallback((text: string) => {
        setInput(text);
    }, []);

    // Group messages by date
    const groupMessagesByDate = useCallback((msgs: IChatMessage[]) => {
        const grouped: { date: string; messages: IChatMessage[] }[] = [];
        let currentDate = '';

        msgs.forEach((msg) => {
            if (msg.date !== currentDate) {
                currentDate = msg.date;
                grouped.push({ date: currentDate, messages: [msg] });
            } else {
                grouped[grouped.length - 1].messages.push(msg);
            }
        });

        return grouped;
    }, []);

    return {
        refs: {
            flatListRef,
        },
        values: {
            chatId,
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
            groupMessagesByDate,
            refetch,
        },
    };
};

export default useChatDetailController;

