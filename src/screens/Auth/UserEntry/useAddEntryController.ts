import { useCallback, useEffect, useRef, useState } from 'react';
import Toast from 'react-native-toast-message';
import useToggle from '../../../hooks/useToggle';
import { useLoginMutation, useSignupMutation } from '../../../redux/Apis/Auth';
import { LOGIN_TABS } from '../../../utils/data';
import { formHandler, normalizeDialingCode } from '../../../utils/helper';
import { navigate } from '../../../utils/navigation';
import { ROUTES } from '../../../utils/routes';
import { LOGIN_SCHEMA, USER_REGISTER_SCHEMA } from '../../../utils/validators';

const initial = {
  login: {
    email: '',
    password: '',
  },
  register: {
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    dialing_code: '+971',
    country_code: 'AE',
    phone: '',
  },
};

const useAddEntryController = () => {
  const formik_ref = useRef(null);

  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [signup, { isLoading: isSignupLoading }] = useSignupMutation();

  const [selected, setSelected] = useState<string>(LOGIN_TABS[0].value);
  const [toggleRemember, remember] = useToggle();

  useEffect(() => {
    formik_ref.current?.resetForm?.();
  }, [selected]);

  const onSubmit = useCallback(
    async (data: any) => {
      if (selected === 'login') {
        try {
          await login({
            email: data.email,
            password: data.password,
          }).unwrap();
        } catch (e: any) {
          const body = e?.data ?? {};
          if (body?.can_resend_otp === true && body?.email) {
            navigate(ROUTES.VERIFY_EMAIL_OTP, { email: body.email });
          }
        }
        return;
      }

      try {
        const formData = formHandler({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          password: data.password,
          password_confirmation: data.password_confirmation,
          dialing_code: normalizeDialingCode(data.dialing_code),
          country_code: data.country_code,
          phone: data.phone,
          source: 'user',
        });

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
        navigate(ROUTES.VERIFY_EMAIL_OTP, { email });
      } catch {
        // errors handled globally
      }
    },
    [selected, login, signup],
  );

  return {
    refs: {
      formik_ref,
    },
    schema: selected === 'login' ? LOGIN_SCHEMA : USER_REGISTER_SCHEMA,
    values: {
      initial: selected === 'login' ? initial.login : initial.register,
      selected,
      remember,
      isLoading: isSignupLoading || isLoginLoading,
    },
    functions: {
      toggleRemember,
      setSelected,
      onSubmit,
    },
  };
};

export default useAddEntryController;
