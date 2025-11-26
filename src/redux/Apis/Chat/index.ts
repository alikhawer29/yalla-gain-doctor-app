import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../../Store';

export const chatApi = createApi({
    reducerPath: 'chatApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://custom-dev.onlinetestingserver.com/yalla-backend/api/doctor_trainer/',
        prepareHeaders: (headers, { getState }) => {
            const state = getState() as RootState;
            const token = state?.auth?.token;

            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }

            headers.set('Accept', 'application/json');
            return headers;
        },
    }),
    tagTypes: ['ChatList', 'Chat', 'UnreadCount'],
    endpoints: (builder) => ({
        // Get list of all chats
        getChatList: builder.query({
            query: () => ({
                url: 'chat/getChatList',
                method: 'GET',
            }),
            providesTags: ['ChatList'],
            keepUnusedDataFor: 0,
        }),

        // Get messages for a specific chat
        getChat: builder.query({
            query: (chatId: number) => ({
                url: `chat/getChat/${chatId}`,
                method: 'GET',
            }),
            providesTags: ['Chat'],
            keepUnusedDataFor: 0,
        }),

        // Create admin chat
        createAdminChat: builder.mutation({
            query: () => ({
                url: 'chat/create',
                method: 'POST',
            }),
            invalidatesTags: ['ChatList'],
        }),

        // Send message
        sendMessage: builder.mutation({
            query: (payload: { chat_id: number; message: string; files?: any[] }) => {
                const formData = new FormData();
                formData.append('chat_id', payload.chat_id.toString());
                formData.append('message', payload.message);

                if (payload.files && payload.files.length > 0) {
                    payload.files.forEach((file, index) => {
                        formData.append(`files[${index}]`, file);
                    });
                }

                return {
                    url: 'chat/sendMessage',
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                };
            },
            invalidatesTags: ['Chat', 'ChatList'],
        }),

        // Get unread chats count
        getUnreadChats: builder.query({
            query: () => ({
                url: 'chat/getUnread-chats',
                method: 'GET',
            }),
            providesTags: ['UnreadCount'],
            keepUnusedDataFor: 0,
        }),
    }),
});

export const {
    useGetChatListQuery,
    useGetChatQuery,
    useCreateAdminChatMutation,
    useSendMessageMutation,
    useGetUnreadChatsQuery,
} = chatApi;

