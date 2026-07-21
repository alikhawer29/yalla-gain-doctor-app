import { RouteProp, useRoute } from '@react-navigation/native';
import { useCallback, useRef } from 'react';
import Toast from 'react-native-toast-message';
import usePicker from '../../../hooks/usePicker';
import { AuthStackParamList } from '../../../interfaces';
import { useSignupMutation } from '../../../redux/Apis/Auth';
import {
  capitalize,
  formHandler,
  getCities,
  getStates,
  normalizeDialingCode,
  toUploadAsset,
} from '../../../utils/helper';
import { getDeviceTimezone } from '../../../utils/device';
import { navigateAndSimpleReset } from '../../../utils/navigation';
import { ROUTES } from '../../../utils/routes';
import { SIGNUP_SCHEMA } from '../../../utils/validators';

type RegisterRouteProp = RouteProp<AuthStackParamList, 'Register'>;

const initial = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  password_confirmation: '',
  dialing_code: '+971',
  country_code: 'AE',
  phone: '',
  language: '',
  state: '',
  city: '',
  bio: '',
  gender: '',
  photo: null,
  experience: [{ experience: '', specialization: '' }],
  certificates: [
    { institute_name: '', certificate_title: '', certificate_picture: null },
  ],
};

const useRegisterController = () => {
  const { openGallery } = usePicker();

  const formik_ref = useRef(null);
  const { params } = useRoute<RegisterRouteProp>();

  const [signup, { isLoading }] = useSignupMutation();

  const onSubmit = useCallback(
    async (data: any) => {
      let payload: Record<string, unknown> = { ...data };
      if (payload.photo) {
        payload.photo = toUploadAsset(payload.photo);
      }
      if (Array.isArray(payload.certificates)) {
        payload.certificates = payload.certificates.map((c: any) => ({
          ...c,
          certificate_picture: c.certificate_picture
            ? toUploadAsset(c.certificate_picture)
            : c.certificate_picture,
        }));
      }
      payload.source = params.type;
      payload.dialing_code = normalizeDialingCode(
        payload.dialing_code as string,
      );
      payload.timezone = getDeviceTimezone();
      const formData = formHandler(payload);

      try {
        const res: any = await signup(formData).unwrap();
        const message =
          res?.message ??
          'Registration successful. Please verify the OTP sent to your email.';
        const email = res?.data?.user?.email ?? data.email;

        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: message,
        });
        navigateAndSimpleReset(ROUTES.VERIFY_EMAIL_OTP, 0, { email });
      } catch {
        // errors handled globally
      }
    },
    [params.type, signup],
  );

  const onPressBackToLogin = useCallback(() => {
    navigateAndSimpleReset(ROUTES.USER_ENTRY);
  }, []);

  const tabs = [
    { label: `Register As ${capitalize(params.type)}`, value: 'register' },
  ];

  return {
    refs: {
      formik_ref,
    },
    schema: SIGNUP_SCHEMA,
    values: {
      initial,
      isLoading,
      states: getStates(),
      cities: getCities,
      tabs,
    },
    functions: {
      onSubmit,
      onPressBackToLogin,
      openGallery,
    },
  };
};

export default useRegisterController;
