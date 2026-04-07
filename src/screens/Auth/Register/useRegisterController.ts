import { RouteProp, useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useRef } from 'react';
import { useModal } from '../../../contexts/ModalContext';
import usePicker from '../../../hooks/usePicker';
import { AuthStackParamList } from '../../../interfaces';
import { useSignupMutation } from '../../../redux/Apis/Auth';
import {
  capitalize,
  formHandler,
  getCities,
  getStates,
} from '../../../utils/helper';
import { navigateAndSimpleReset } from '../../../utils/navigation';
import { ROUTES } from '../../../utils/routes';
import { SIGNUP_SCHEMA } from '../../../utils/validators';

type RegisterRouteProp = RouteProp<AuthStackParamList, 'Register'>;

/** Strip UI-only / extra keys before multipart upload */
const toUploadAsset = (asset: any) => {
  if (!asset || typeof asset !== 'object' || !asset.uri) return asset;
  return {
    uri: asset.uri,
    type: asset.type,
    name: asset.name ?? asset.fileName ?? 'image.jpg',
    fileName: asset.fileName ?? asset.name ?? 'image.jpg',
  };
};

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

  const { showOkModal } = useModal();

  const [submit, { isSuccess, isLoading }] = useSignupMutation();

  useEffect(() => {
    if (isSuccess) {
      showOkModal(
        {
          type: 'success',
          title: 'Successfully',
          message:
            'Your information has been successfully submitted to the admin. You can log in after approval.',
        },
        () => navigateAndSimpleReset(ROUTES.USER_ENTRY),
      );
    }
  }, [isSuccess]);

  const onSubmit = useCallback(
    (data: any) => {
      let payload = { ...data };
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
      console.log('payload', payload);
      payload.source = params.type;
      payload = formHandler(payload);
      submit(payload);
    },
    [params],
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
