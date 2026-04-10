import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../../Store';
import { DOCTOR_TRAINER_API_BASE_URL } from '../../../utils/data';

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: fetchBaseQuery({
    baseUrl: DOCTOR_TRAINER_API_BASE_URL,
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
  endpoints: builder => ({
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

    /** Create admin chat when none exists (see Chat screen guard). */
    createAdminChat: builder.mutation({
      query: (payload: { user_id?: number } = {}) => {
        const formData = new FormData();
        if (payload?.user_id != null) {
          formData.append('user_id', String(payload.user_id));
        }
        return {
          url: 'chat/createAdmin',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['ChatList'],
    }),

    // Send message (multipart; do not set Content-Type — RN/fetch must add boundary)
    sendMessage: builder.mutation({
      query: (payload: {
        chat_id: number;
        message: string;
        files?: { uri: string; name: string; type: string }[];
      }) => {
        const formData = new FormData();
        formData.append('chat_id', payload.chat_id.toString());
        formData.append('message', payload.message);

        if (payload.files && payload.files.length > 0) {
          payload.files.forEach((file, index) => {
            formData.append(`files[${index}]`, {
              uri: file.uri,
              name: file.name || `attachment_${index}`,
              type: file.type || 'application/octet-stream',
            } as any);
          });
        }

        return {
          url: 'chat/sendMessage',
          method: 'POST',
          body: formData,
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
