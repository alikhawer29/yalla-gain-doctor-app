import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../../Store';
import { DOCTOR_TRAINER_API_BASE_URL } from '../../../utils/data';

export type HealthProgressBmiPoint = {
  month: number;
  label: string;
  bmi: number;
};

export type HealthProgressCaloriesPoint = {
  day: string;
  calories: number;
};

export type HealthProgressData = {
  user_id?: number;
  year?: number;
  total_steps?: number;
  total_calories?: number;
  bmi_monthly_graph?: HealthProgressBmiPoint[];
  calories_graph?: {
    filter?: string;
    data?: HealthProgressCaloriesPoint[];
  };
};

export type HealthProgressApiResponse = {
  data?: HealthProgressData;
  status?: boolean;
  message?: string;
};

export type PaymentLogItem = {
  id: number;
  booking_id: string;
  booking_amount: number;
  payment_date: string;
  commission: number;
  tip: number;
  payment_amount: number;
};

export type PaymentLogsApiResponse = {
  data?: {
    total_earnings?: number;
    payment_logs?: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
      data: PaymentLogItem[];
    };
  };
  status?: boolean;
};

export type UaeLastPayout = {
  amount?: number | string;
  date?: string;
  status?: string;
  created_at?: string;
};

export type UaeBeneficiary = {
  id: number;
  account_holder_name?: string;
  iban?: string;
  iban_last4?: string;
  currency?: string;
  is_default_for_payout?: boolean;
  payouts_enabled?: boolean;
  last_payout?: UaeLastPayout | null;
};

export type CreateUaeBeneficiaryBody = {
  account_holder_name: string;
  iban: string;
  line1: string;
  tax_id: string;
  state: string;
};

export type CreateUaeBeneficiaryApiResponse = {
  already_exists?: boolean;
  message?: string;
  data?: UaeBeneficiary;
  status?: boolean;
};

export type WithdrawUaeApiResponse = {
  message?: string;
  data?: {
    status?: string;
    amount?: number | string;
    remaining_coins?: number | string;
    coins_balance_after?: number | string;
  };
  status?: boolean;
};

export type UaeTransactionLogItem = {
  id?: number | string;
  amount?: number | string;
  currency?: string;
  status?: string;
  type?: string;
  date?: string;
  created_at?: string;
  payment_date?: string;
  coins_deducted?: number | string;
  coins_balance_before?: number | string;
  coins_balance_after?: number | string;
  stripe_payout_id?: string;
  stripe_transfer_id?: string | null;
  beneficiary?: {
    account_holder_name?: string;
    name?: string;
    iban?: string;
    iban_last4?: string;
  };
};

export type UaeTransactionLogsApiResponse = {
  /** Either an array of logs (with `meta` for pagination) or a nested envelope. */
  data?:
    | UaeTransactionLogItem[]
    | {
        transaction_logs?: {
          current_page: number;
          last_page: number;
          per_page: number;
          total: number;
          data: UaeTransactionLogItem[];
        };
        items?: UaeTransactionLogItem[];
        data?: UaeTransactionLogItem[];
      };
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  status?: boolean;
  message?: string;
};

export const userApi = createApi({
  reducerPath: 'userApi',
  tagTypes: [
    'Wallet',
    'UaeBeneficiaries',
    'UaeTransactionLogs',
    'Notifications',
  ],
  baseQuery: fetchBaseQuery({
    baseUrl: DOCTOR_TRAINER_API_BASE_URL,
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
      query: (params?: { search?: string }) => ({
        url: `service-categories`,
        method: 'GET',
        params,
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
        method: 'DELETE',
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
        method: 'DELETE',
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
    startZoomSession: builder.mutation({
      query: id => ({
        url: `my-booking/${id}/zoom/start-session`,
        method: 'POST',
      }),
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
      providesTags: ['Wallet'],
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
      invalidatesTags: ['Wallet'],
    }),
    getFaqs: builder.query({
      query: () => ({
        url: `faqs`,
        method: 'GET',
      }),
    }),
    getNotifications: builder.query({
      query: params => ({
        url: `notification/all/list`,
        method: 'GET',
        params,
      }),
      providesTags: ['Notifications'],
    }),
    readAllNotifications: builder.mutation({
      query: () => ({
        url: `notification/all/read`,
        method: 'POST',
      }),
      invalidatesTags: ['Notifications'],
    }),
    readNotification: builder.mutation({
      query: body => ({
        url: `notification/read`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Notifications'],
    }),
    unreadNotification: builder.mutation({
      query: body => ({
        url: `notification/unread`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Notifications'],
    }),
    getDashboardStats: builder.query<
      {
        data?: { total_bookings?: number; total_earnings?: number };
        status?: boolean;
      },
      void
    >({
      query: () => ({
        url: `dashboard/stats`,
        method: 'GET',
      }),
      keepUnusedDataFor: 0,
    }),
    getDashboardEarningsGraph: builder.query<
      {
        filter?: string;
        data?: Array<{
          day?: string;
          date?: string;
          month?: string;
          earnings?: number;
        }>;
        status?: boolean;
      },
      { filter: 'weekly' | 'monthly' | 'yearly' }
    >({
      query: ({ filter }) => ({
        url: `dashboard/earnings-graph`,
        method: 'GET',
        params: { filter },
      }),
      keepUnusedDataFor: 0,
    }),
    getDashboardBookingsGraph: builder.query<
      {
        filter?: string;
        data?: Array<{
          day?: string;
          date?: string;
          month?: string;
          bookings?: number;
        }>;
        status?: boolean;
      },
      { filter: 'weekly' | 'monthly' | 'yearly' }
    >({
      query: ({ filter }) => ({
        url: `dashboard/bookings-graph`,
        method: 'GET',
        params: { filter },
      }),
      keepUnusedDataFor: 0,
    }),
    getPaymentLogs: builder.query<
      PaymentLogsApiResponse,
      {
        from?: string;
        to?: string;
        page?: number;
        per_page?: number;
      }
    >({
      query: ({ from, to, page = 1, per_page = 15 }) => ({
        url: `dashboard/payment-logs`,
        method: 'GET',
        params: {
          ...(from ? { from } : {}),
          ...(to ? { to } : {}),
          page,
          per_page,
        },
      }),
      keepUnusedDataFor: 0,
    }),
    getUaeBeneficiaries: builder.query<unknown, void>({
      query: () => ({
        url: `stripe/uae/beneficiaries`,
        method: 'GET',
      }),
      providesTags: ['UaeBeneficiaries'],
      keepUnusedDataFor: 0,
    }),
    createUaeBeneficiary: builder.mutation<
      CreateUaeBeneficiaryApiResponse,
      CreateUaeBeneficiaryBody
    >({
      query: body => ({
        url: `stripe/uae/beneficiaries`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['UaeBeneficiaries', 'Wallet'],
    }),
    withdrawUaeBeneficiary: builder.mutation<
      WithdrawUaeApiResponse,
      { beneficiaryId: number; amount: number }
    >({
      query: ({ beneficiaryId, amount }) => ({
        url: `stripe/uae/beneficiaries/${beneficiaryId}/withdraw`,
        method: 'POST',
        body: { amount },
      }),
      invalidatesTags: ['UaeBeneficiaries', 'Wallet', 'UaeTransactionLogs'],
    }),
    getUaeTransactionLogs: builder.query<
      UaeTransactionLogsApiResponse,
      {
        page?: number;
        per_page?: number;
        status?: string;
        from?: string;
        to?: string;
      }
    >({
      query: ({ page = 1, per_page = 15, status, from, to }) => ({
        url: `stripe/uae/transaction-logs`,
        method: 'GET',
        params: {
          page,
          per_page,
          ...(status ? { status } : {}),
          ...(from ? { from } : {}),
          ...(to ? { to } : {}),
        },
      }),
      providesTags: ['UaeTransactionLogs'],
      keepUnusedDataFor: 0,
    }),
    getHealthProgress: builder.query<
      HealthProgressApiResponse,
      {
        userId: string | number;
        calories_filter: 'weekly' | 'monthly';
        year?: number;
      }
    >({
      query: ({ userId, calories_filter, year }) => ({
        url: `user/${userId}/health-progress`,
        method: 'GET',
        params: {
          calories_filter,
          ...(year != null ? { year } : {}),
        },
      }),
      keepUnusedDataFor: 0,
    }),
    getConsultationFees: builder.query({
      query: params => ({
        url: `consultation-fees`,
        method: 'GET',
        params,
      }),
      keepUnusedDataFor: 0,
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
  useGetConsultationFeesQuery,
  useGetBookingByIdQuery,
  useUpdateAppointmentStatusMutation,
  useGetBookingsQuery,
  useUpdatePrescriptionMutation,
  useStartZoomSessionMutation,
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
  useGetFaqsQuery,
  useGetNotificationsQuery,
  useReadAllNotificationsMutation,
  useReadNotificationMutation,
  useUnreadNotificationMutation,
  useGetDashboardStatsQuery,
  useGetDashboardEarningsGraphQuery,
  useGetDashboardBookingsGraphQuery,
  useGetPaymentLogsQuery,
  useGetUaeBeneficiariesQuery,
  useCreateUaeBeneficiaryMutation,
  useWithdrawUaeBeneficiaryMutation,
  useGetUaeTransactionLogsQuery,
  useGetHealthProgressQuery,
} = userApi;
