import { RouteProp, useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import Toast from 'react-native-toast-message';
import { useModal } from '../../../contexts/ModalContext';
import { AuthStackParamList } from '../../../interfaces';
import {
  useResendOtpMutation,
  useVerifyOtpMutation,
} from '../../../redux/Apis/Auth';
import { logout } from '../../../redux/Slices/AuthSlice';
import { navigateAndSimpleReset } from '../../../utils/navigation';
import { getDeviceType, getFcmDeviceToken } from '../../../utils/device';
import { ROUTES } from '../../../utils/routes';
import { VERIFY_OTP_SCHEMA } from '../../../utils/validators';

type VerifyEmailOtpRouteProp = RouteProp<AuthStackParamList, 'VerifyEmailOtp'>;

const TIMER_SEC = 59;

const OTP_SUCCESS_MESSAGE =
  'Email verified successfully. Your information has been sent to the admin for approval.';

const useVerifyEmailOtpController = () => {
  const dispatch = useDispatch();
  const { showOkModal } = useModal();
  const formik_ref = useRef(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { params } = useRoute<VerifyEmailOtpRouteProp>();
  const initialTimerSeconds =
    params.fromLogin === true ? 0 : TIMER_SEC;
  const [seconds, setSeconds] = useState(initialTimerSeconds);

  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: resendLoading }] = useResendOtpMutation();

  const initial = { otp: '' };

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSeconds(prev => (prev <= 0 ? 0 : prev - 1));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const onSubmit = useCallback(
    async (values: { otp: string }) => {
      try {
        const device_token = await getFcmDeviceToken();
        await verifyOtp({
          email: params.email,
          otp: values.otp,
          device_type: getDeviceType(),
          device_token,
        }).unwrap();
        showOkModal(
          {
            type: 'success',
            title: 'Success',
            message: OTP_SUCCESS_MESSAGE,
          },
          () => {
            dispatch(logout());
            navigateAndSimpleReset(ROUTES.USER_ENTRY, 0, { type: '' });
          },
        );
      } catch {
        // invalid / expired OTP — global error middleware shows API message
      }
    },
    [dispatch, params.email, showOkModal, verifyOtp],
  );

  const onResend = useCallback(async () => {
    if (seconds > 0 || resendLoading) return;
    try {
      await resendOtp({ email: params.email }).unwrap();
      Toast.show({
        text1: 'Success',
        text2: 'We have sent a new verification code to your email.',
        type: 'success',
      });
      setSeconds(TIMER_SEC);
    } catch {
      // middleware may show error
    }
  }, [params.email, resendOtp, resendLoading, seconds]);

  const onPressBackToLogin = useCallback(() => {
    navigateAndSimpleReset(ROUTES.USER_ENTRY, 0, { type: '' });
  }, []);

  return {
    refs: { formik_ref },
    schema: VERIFY_OTP_SCHEMA,
    values: {
      initial,
      email: params.email,
      isLoading,
      timer: seconds,
      resendLoading,
    },
    functions: {
      onSubmit,
      onPressBackToLogin,
      onResend,
    },
  };
};

export default useVerifyEmailOtpController;
