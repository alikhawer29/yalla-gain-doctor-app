import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../../Store';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl:
      'https://custom-dev.onlinetestingserver.com/yalla-backend/api/doctor_trainer/',
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const token = state?.auth?.token;

      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }

      headers.set('Accept', `application/json`);
      return headers;
    },
  }),
  endpoints: builder => ({
    changePassword: builder.mutation({
      query: body => ({
        url: `change-password`,
        method: 'POST',
        body,
      }),
    }),
    updateProfile: builder.mutation({
      query: body => ({
        url: `profile/update`,
        method: 'POST',
        body,
      }),
    }),
    getServiceCategories: builder.query({
      query: () => ({
        url: `service-categories`,
        method: 'GET',
      }),
      keepUnusedDataFor: 0,
    }),
    createServiceCategory: builder.mutation({
      query: payload => ({
        url: payload?.id ? `service/${payload?.id}/update` : `service`,
        method: 'POST',
        body: payload?.body,
      }),
    }),
    getMyServices: builder.query({
      query: params => ({
        url: params?.id ? `my-services/${params?.id}` : `my-services`,
        method: 'GET',
        params,
      }),
      keepUnusedDataFor: 0,
    }),
    deleteMyService: builder.mutation({
      query: id => ({
        url: `service/${id}/delete`,
        method: 'POST',
      }),
    }),
    getServiceSlots: builder.query({
      query: id => ({
        url: `my-service-slots/${id}`,
        method: 'GET',
      }),
      keepUnusedDataFor: 0,
    }),
    updateServiceSlots: builder.mutation({
      query: payload => ({
        url: `service-slots/${payload?.id}`,
        method: 'POST',
        body: payload?.body,
      }),
    }),
    deleteProfile: builder.mutation({
      query: () => ({
        url: `delete-account`,
        method: 'POST',
      }),
    }),
    getSubscriptionPlans: builder.query({
      query: () => ({
        url: `plans`,
        method: 'GET',
      }),
      keepUnusedDataFor: 0,
    }),
    getSubscriptionLogs: builder.query({
      query: () => ({
        url: `subscription-logs`,
        method: 'GET',
      }),
      keepUnusedDataFor: 0,
    }),
    subscribe: builder.mutation({
      query: body => ({
        url: `payment`,
        method: 'POST',
        body,
      }),
    }),
    cancelSubscription: builder.mutation({
      query: id => ({
        url: `subscription/${id}/cancel`,
        method: 'POST',
      }),
    }),
    getAppointmentRequests: builder.query({
      query: params => ({
        url: `my-bookings/requests`,
        method: 'GET',
        params,
      }),
      keepUnusedDataFor: 0,
    }),
    getBookingById: builder.query({
      query: id => ({
        url: `my-booking/${id}`,
        method: 'GET',
      }),
      keepUnusedDataFor: 0,
    }),
    updateAppointmentStatus: builder.mutation({
      query: payload => ({
        url: `my-booking/${payload.id}/${payload.type}`,
        method: 'POST',
        body: payload.body,
      }),
    }),
    updatePrescription: builder.mutation({
      query: payload => ({
        url: `my-booking/${payload.id}/prescription`,
        method: 'POST',
        body: payload.body,
      }),
    }),
    createZoomMeeting: builder.mutation({
      query: id => ({
        url: `appointments/${id}/zoom/create`,
        method: 'POST',
      }),
    }),
    getZoomDetails: builder.query({
      query: id => ({
        url: `appointments/${id}/zoom/details`,
        method: 'GET',
      }),
      keepUnusedDataFor: 0,
    }),
    endZoomMeeting: builder.mutation({
      query: id => ({
        url: `appointments/${id}/zoom/end`,
        method: 'POST',
      }),
    }),
    getBookings: builder.query({
      query: params => ({
        url: `my-bookings`,
        method: 'GET',
        params,
      }),
      keepUnusedDataFor: 0,
    }),
    getBookingHistory: builder.query({
      query: params => ({
        url: `appointments/${params?.id}/history`,
        method: 'GET',
        params,
      }),
      keepUnusedDataFor: 0,
    }),
    getReviews: builder.query({
      query: params => ({
        url: `my-ratings`,
        method: 'GET',
        params,
      }),
      keepUnusedDataFor: 0,
    }),
    // Newsfeed
    createFeed: builder.mutation({
      query: body => ({
        url: `post`,
        method: 'POST',
        body,
      }),
    }),
    updateFeed: builder.mutation({
      query: ({ id, body }) => ({
        url: `post/${id}/update`,
        method: 'POST',
        body,
      }),
    }),
    deleteFeed: builder.mutation({
      query: id => ({
        url: `post/${id}/delete`,
        method: 'POST',
      }),
    }),
    reactFeed: builder.mutation({
      query: ({ id, body }) => ({
        url: `post/${id}/react`,
        method: 'POST',
        body,
      }),
    }),
    reactComment: builder.mutation({
      query: ({ id, body }) => ({
        url: `comment/${id}/react`,
        method: 'POST',
        body,
      }),
    }),
    postComment: builder.mutation({
      query: ({ id, body }) => ({
        url: `post/${id}/comment`,
        method: 'POST',
        body,
      }),
    }),
    deleteComment: builder.mutation({
      query: id => ({
        url: `comment/${id}/remove`,
        method: 'POST',
      }),
    }),
    reportFeed: builder.mutation({
      query: ({ id, body }) => ({
        url: `post/${id}/report`,
        method: 'POST',
        body,
      }),
    }),
    votePoll: builder.mutation({
      query: ({ post_id, option_id }) => ({
        url: `post/${post_id}/${option_id}/report`,
        method: 'POST',
      }),
    }),
    getFeeds: builder.query({
      query: query => ({
        url: query?.user_id ? `posts/${query?.user_id}` : `posts`,
        method: 'GET',
        query,
      }),
    }),
    getFeedById: builder.query({
      query: id => ({
        url: `post/${id}`,
        method: 'GET',
      }),
    }),
    getMyFeeds: builder.query({
      query: () => ({
        url: `posts/my/get`,
        method: 'GET',
      }),
    }),
    getComments: builder.query({
      query: id => ({
        url: `post/${id}/comments`,
        method: 'GET',
      }),
    }),
    getReacts: builder.query({
      query: id => ({
        url: `post/${id}/reacted`,
        method: 'GET',
      }),
    }),
    // workout
    saveVideo: builder.mutation({
      query: id => ({
        url: `video/${id}/save`,
        method: 'POST',
      }),
    }),
    getSavedContent: builder.query({
      query: params => ({
        url: `saved/videos`,
        method: 'GET',
        params,
      }),
    }),
    getWorkout: builder.query({
      query: params => ({
        url: `workout-contents`,
        method: 'GET',
        params,
      }),
    }),
    getVideosByWorkout: builder.query({
      query: data => ({
        url: `workout-content/${data?.id}/videos`,
        method: 'GET',
        params: data?.params,
      }),
    }),
    getVideoDetails: builder.query({
      query: id => ({
        url: `video/${id}`,
        method: 'GET',
      }),
    }),
    getAvatar: builder.query({
      query: (userId: string | number) => ({
        url: `avatar`,
        method: 'GET',
        params: { user_id: userId },
      }),
      keepUnusedDataFor: 0,
    }),
    getWallet: builder.query({
      query: () => ({
        url: `wallet`,
        method: 'GET',
      }),
      keepUnusedDataFor: 0,
    }),
    contactUs: builder.mutation({
      query: body => ({
        url: `contact-us`,
        method: 'POST',
        body,
      }),
    }),
    withdraw: builder.mutation({
      query: body => ({
        url: `stripe/custom/bank/raw`,
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useChangePasswordMutation,
  useUpdateProfileMutation,
  useGetServiceCategoriesQuery,
  useCreateServiceCategoryMutation,
  useGetMyServicesQuery,
  useDeleteMyServiceMutation,
  useGetServiceSlotsQuery,
  useUpdateServiceSlotsMutation,
  useDeleteProfileMutation,
  useGetAppointmentRequestsQuery,
  useGetBookingByIdQuery,
  useUpdateAppointmentStatusMutation,
  useGetBookingsQuery,
  useUpdatePrescriptionMutation,
  useCreateZoomMeetingMutation,
  useGetZoomDetailsQuery,
  useLazyGetZoomDetailsQuery,
  useEndZoomMeetingMutation,
  useGetBookingHistoryQuery,
  useGetReviewsQuery,
  // old
  useGetSubscriptionPlansQuery,
  useGetSubscriptionLogsQuery,
  useSubscribeMutation,
  useCancelSubscriptionMutation,
  useCreateFeedMutation,
  useUpdateFeedMutation,
  useDeleteFeedMutation,
  useReactFeedMutation,
  useReactCommentMutation,
  usePostCommentMutation,
  useDeleteCommentMutation,
  useReportFeedMutation,
  useVotePollMutation,
  useGetFeedsQuery,
  useGetFeedByIdQuery,
  useGetMyFeedsQuery,
  useGetCommentsQuery,
  useGetReactsQuery,
  useGetWorkoutQuery,
  useGetSavedContentQuery,
  useGetVideosByWorkoutQuery,
  useGetVideoDetailsQuery,
  useSaveVideoMutation,
  useGetAvatarQuery,
  useWithdrawMutation,
  useGetWalletQuery,
  useContactUsMutation,
} = userApi;
