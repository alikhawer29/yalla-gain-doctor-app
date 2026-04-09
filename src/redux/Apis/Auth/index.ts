import type { BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/query'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import {
    DOCTOR_TRAINER_API_BASE_URL,
    YALLA_API_BASE_URL,
} from '../../../utils/data'

const prepareAuthHeaders = (headers: Headers) => {
    headers.set('Accept', `application/json`)
    return headers
}

const doctorTrainerBaseQuery = fetchBaseQuery({
    baseUrl: DOCTOR_TRAINER_API_BASE_URL,
    prepareHeaders: prepareAuthHeaders,
})

/** OTP endpoints live under `/yalla-backend/api/`, not `/doctor_trainer/`. */
const yallaApiRootQuery = fetchBaseQuery({
    baseUrl: YALLA_API_BASE_URL,
    prepareHeaders: prepareAuthHeaders,
})

const baseQuery: BaseQueryFn<string | FetchArgs, unknown, unknown> = (
    args,
    api,
    extraOptions,
) => {
    const url = typeof args === 'string' ? args : args.url
    if (url === 'verify-otp' || url === 'resend-otp') {
        return yallaApiRootQuery(args, api, extraOptions)
    }
    return doctorTrainerBaseQuery(args, api, extraOptions)
}

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery,
    endpoints: (builder) => ({
        signup: builder.mutation({
            query: (body) => ({
                url: `signup`,
                method: "POST",
                body,
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Accept': 'application/json'
                }
            }),

        }),
        verifyOtp: builder.mutation({
            query: (body: Record<string, unknown>) => ({
                url: `verify-otp`,
                method: 'POST',
                body,
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            }),
        }),
        resendOtp: builder.mutation({
            query: (body: { email: string }) => ({
                url: `resend-otp`,
                method: 'POST',
                body,
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            }),
        }),
        login: builder.mutation({
            query: (body) => ({
                url: `login`,
                method: "POST",
                body
            }),
        }),
        forgotPassword: builder.mutation({
            query: (body) => ({
                url: `reset/password`,
                method: "POST",
                body
            }),
            transformResponse: (response: any, meta: any) => {
                meta.show_success = true
                meta.message = "Verification code has been sent to your email."
                return response;
            }
        }),
        verify: builder.mutation({
            query: (body) => ({
                url: `verify/code`,
                method: "POST",
                body
            }),
        }),
        setPassword: builder.mutation({
            query: (body) => ({
                url: `set/password`,
                method: "POST",
                body
            }),
        }),

    }),
})

export const {
    useLoginMutation,
    useSignupMutation,
    useVerifyOtpMutation,
    useResendOtpMutation,
    useForgotPasswordMutation,
    useVerifyMutation,
    useSetPasswordMutation,
} = authApi