import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { io, Socket } from 'socket.io-client';
import { useGetChatQuery, useSendMessageMutation } from '../../redux/Apis/Chat';
import { RootStackParamList, IChatMessage } from '../../interfaces';
import { chatApi } from '../../redux/Apis/Chat';
import { useDispatch } from 'react-redux';

const SOCKET_URL = 'https://custom-dev.onlinetestingserver.com';
const SOCKET_PORT = 2170;

type ChatDetailRouteProp = RouteProp<RootStackParamList, 'ChatDetail'>;

const useChatDetailController = () => {
    const route = useRoute<ChatDetailRouteProp>();
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { chatId, name, image, user_role } = route.params;

    const flatListRef = useRef<FlatList>(null);
    const socketRef = useRef<Socket | null>(null);

    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<IChatMessage[]>([]);

    const { data: chatData, isLoading, refetch } = useGetChatQuery(chatId);
    const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();

    // Initialize messages from API
    useEffect(() => {
        if (chatData?.data) {
            setMessages(chatData.data);
        }
    }, [chatData]);

    // Initialize socket connection
    useEffect(() => {
        socketRef.current = io(`${SOCKET_URL}:${SOCKET_PORT}`, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current.on('connect', () => {
            console.log('Socket connected');
        });

        // Listen for messages on this chat
        socketRef.current.on(String(chatId), (data: IChatMessage) => {
            setMessages((prev) => [...prev, data]);
            scrollToEnd();
        });

        // Listen for general receive message event
        socketRef.current.on('receiveMessage', (data: IChatMessage) => {
            if (data.chat_id === chatId) {
                setMessages((prev) => {
                    // Avoid duplicates
                    if (prev.some(msg => msg.id === data.id)) {
                        return prev;
                    }
                    return [...prev, data];
                });
                scrollToEnd();
            }
        });

        socketRef.current.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [chatId]);

    const scrollToEnd = useCallback(() => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, []);

    const handleSendMessage = useCallback(async () => {
        if (!input.trim()) return;

        const messageText = input.trim();
        setInput('');

        try {
            const result = await sendMessage({
                chat_id: chatId,
                message: messageText,
            }).unwrap();

            // Emit socket event
            if (socketRef.current && result?.data) {
                socketRef.current.emit('sendMessage', result.data);
            }

            // Invalidate chat list to update last message
            dispatch(chatApi.util.invalidateTags(['ChatList']));
            
            scrollToEnd();
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    }, [input, chatId, sendMessage, dispatch, scrollToEnd]);

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
            isLoading,
            isSending,
        },
        functions: {
            handleSendMessage,
            handleBack,
            onChangeInput,
            groupMessagesByDate,
            refetch,
        },
    };
};

export default useChatDetailController;

