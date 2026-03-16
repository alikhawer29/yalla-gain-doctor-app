import { useCallback, useEffect, useRef } from 'react';
import { useModal } from '../../contexts/ModalContext';
import { useAppSelector } from '../../hooks';
import { useUpdateProfileMutation } from '../../redux/Apis/User';
import { selectUser } from '../../redux/Slices/AuthSlice';
import { formHandler, getCities, getStates } from '../../utils/helper';
import { goBack } from '../../utils/navigation';
import { EDIT_PROFILE_SCHEMA } from '../../utils/validators';
import usePicker from '../../hooks/usePicker';

const useEditProfileController = () => {
  const user = useAppSelector(selectUser);
  const formik_ref = useRef(null);
  const { showOkModal } = useModal();
  const { openGallery } = usePicker();

  const [submit, { isLoading, isSuccess }] = useUpdateProfileMutation();

  const initial = {
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    dialing_code: user?.dialing_code || '+971',
    country_code: user?.country_code || 'AE',
    phone: user?.phone || '',
    gender: user?.gender || '',
    language: user?.language || '',
    bio: user?.bio || '',
    experience: user?.experience || [],
    certificates: user?.certifications || [],
    state: user?.state || null,
    city: user?.city || null,
    photo: user?.photo || null,
  };

  useEffect(() => {
    if (isSuccess) {
      showOkModal(
        {
          type: 'success',
          title: 'Success',
          message: 'Profile has been updated successfully.',
        },
        () => goBack(),
        () => goBack(),
      );
    }
  }, [isSuccess]);

  const onSubmit = useCallback((data: any) => {
    let payload = { ...data };

    payload = formHandler(payload);

    console.log('Hellooooooooooooooo', payload);

    submit(payload);
  }, []);

  const onPressUpload = useCallback(async () => {
    let photo = await openGallery();
    formik_ref?.current?.setFieldValue('photo', photo);
  }, []);

  return {
    schema: EDIT_PROFILE_SCHEMA,
    refs: {
      formik_ref,
    },
    values: {
      initial,
      isLoading,
      states: getStates(),
    },
    functions: {
      onSubmit,
      onPressUpload,
      cities: getCities,
    },
  };
};

export default useEditProfileController;
