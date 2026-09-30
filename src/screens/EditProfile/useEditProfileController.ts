import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useModal } from '../../contexts/ModalContext';
import { useAppSelector } from '../../hooks';
import { useUpdateProfileMutation } from '../../redux/Apis/User';
import { selectUser } from '../../redux/Slices/AuthSlice';
import {
  formHandler,
  getCities,
  getStates,
  isDevicePickedAsset,
  isRemoteUploadUri,
  normalizeDialingCode,
  toUploadAsset,
} from '../../utils/helper';
import { getDeviceTimezone } from '../../utils/device';
import { navigateToMyProfileTab } from '../../utils/navigation';
import { EDIT_PROFILE_SCHEMA } from '../../utils/validators';
import usePicker from '../../hooks/usePicker';

const mapExperience = (items: any[] | undefined) => {
  if (!items?.length) {
    return [{ experience: '', specialization: '' }];
  }
  return items.map(item => ({
    experience: item?.experience != null ? String(item.experience) : '',
    specialization: item?.specialization ?? '',
  }));
};

const mapCertificates = (items: any[] | undefined) => {
  if (!items?.length) {
    return [
      {
        institute_name: '',
        certificate_title: '',
        certificate_picture: null,
      },
    ];
  }
  return items.map(item => ({
    id: item?.id ?? null,
    institute_name: item?.institute_name ?? '',
    certificate_title: item?.certificate_title ?? '',
    certificate_picture: item?.certificate_picture ?? null,
  }));
};

const useEditProfileController = () => {
  const user = useAppSelector(selectUser);
  const formik_ref = useRef(null);
  const { showOkModal } = useModal();
  const { openGallery } = usePicker();

  const [submit, { isLoading, isSuccess, reset }] = useUpdateProfileMutation();
  const successShownRef = useRef(false);

  const initial = useMemo(
    () => ({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      dialing_code: normalizeDialingCode(user?.dialing_code) || '+971',
      country_code: (user?.country_code || 'AE').toUpperCase(),
      phone: user?.phone ? String(user.phone) : '',
      gender: (user?.gender || '').toLowerCase(),
      language: (user?.language || '').toLowerCase(),
      bio: user?.bio || '',
      experience: mapExperience(user?.experience),
      certificates: mapCertificates(user?.certifications),
      state: user?.state || '',
      city: user?.city || '',
      photo: user?.photo || null,
    }),
    [user],
  );

  const states = useMemo(() => getStates(), []);

  useEffect(() => {
    if (!isSuccess || successShownRef.current) return;

    successShownRef.current = true;
    const onDismiss = () => {
      successShownRef.current = false;
      reset();
    };

    showOkModal(
      {
        type: 'success',
        title: 'Success',
        message: 'Profile has been updated successfully.',
      },
      () => {
        onDismiss();
        navigateToMyProfileTab();
      },
      onDismiss,
    );
  }, [isSuccess, reset]);

  const onSubmit = useCallback(
    (data: any) => {
      successShownRef.current = false;

      let payload: Record<string, unknown> = { ...data };

      if (typeof payload.photo === 'string' && isRemoteUploadUri(payload.photo)) {
        delete payload.photo;
      } else if (isDevicePickedAsset(payload.photo)) {
        payload.photo = toUploadAsset(payload.photo);
      } else if (payload.photo != null) {
        delete payload.photo;
      }

      if (Array.isArray(payload.certificates)) {
        payload.certificates = payload.certificates.map((cert: any) => {
          const picture = cert?.certificate_picture;
          const id = cert?.id != null && cert?.id !== '' ? cert.id : undefined;
          const base = {
            ...(id != null ? { id } : {}),
            institute_name: cert?.institute_name ?? '',
            certificate_title: cert?.certificate_title ?? '',
          };

          // Keep existing remote cert image on server — only upload newly picked files.
          if (isDevicePickedAsset(picture)) {
            return {
              ...base,
              certificate_picture: toUploadAsset(picture),
            };
          }

          return base;
        });
      }

      if (Array.isArray(payload.experience)) {
        payload.experience = payload.experience.map((item: any) => ({
          experience:
            item?.experience != null ? String(item.experience) : '',
          specialization: item?.specialization ?? '',
        }));
      }

      payload.dialing_code = normalizeDialingCode(
        payload.dialing_code as string,
      );
      payload.timezone = getDeviceTimezone();

      const formData = formHandler(payload);
      submit(formData);
    },
    [submit],
  );

  const onPressUpload = useCallback(
    async (setFieldValue?: (field: string, value: unknown) => void) => {
      const photo = await openGallery();
      if (photo) {
        if (typeof setFieldValue === 'function') {
          setFieldValue('photo', photo);
        } else {
          (formik_ref?.current as any)?.setFieldValue('photo', photo);
        }
      }
    },
    [openGallery],
  );

  return {
    schema: EDIT_PROFILE_SCHEMA,
    refs: {
      formik_ref,
    },
    values: {
      initial,
      isLoading,
      states,
    },
    functions: {
      onSubmit,
      onPressUpload,
      openGallery,
      cities: getCities,
    },
  };
};

export default useEditProfileController;
