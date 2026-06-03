import { RouteProp, useIsFocused, useRoute } from '@react-navigation/native';
import { useEffect, useMemo, useRef } from 'react';
import { useModal } from '../../contexts/ModalContext';
import usePicker from '../../hooks/usePicker';
import { RootStackParamList } from '../../interfaces';
import {
  useCreateServiceCategoryMutation,
  useGetConsultationFeesQuery,
  useGetMyServicesQuery,
} from '../../redux/Apis/User';
import { useAppDispatch } from '../../hooks';
import { bumpServiceStack } from '../../redux/Slices/NavigationSlice';
import { formHandler } from '../../utils/helper';
import { navigate, navigateToMyServicesTab } from '../../utils/navigation';
import { ROUTES } from '../../utils/routes';
import {
  ADD_SERVICE_SCHEMA,
  CREATE_SERVICE_SCHEMA,
} from '../../utils/validators';

const baseInitial = {
  title: '',
  charges: '',
  description: '',
  image: null,
  slots: null as FormData | null,
};

function resolveConsultationFee(
  response: { data?: { consultation_fee?: unknown }; consultation_fee?: unknown } | undefined,
): string {
  const raw =
    response?.data?.consultation_fee ?? response?.consultation_fee;
  if (raw == null || raw === '') return '';
  return String(raw);
}

type AddServiceRouteProp = RouteProp<RootStackParamList, 'AddService'>;

const useAddServiceController = () => {
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const { image, openGallery } = usePicker();
  const { showOkModal } = useModal();
  const formik_ref = useRef(null);
  const didResetNewFormRef = useRef(false);
  const { params } = useRoute<AddServiceRouteProp>();
  const is_edit = !!params?.service_id;

  const { data, isSuccess: isServiceSuccess } = useGetMyServicesQuery(
    { id: params?.service_id },
    { skip: !params?.service_id },
  );
  const [submit, { isLoading, isSuccess }] = useCreateServiceCategoryMutation();

  const { data: consultationFeesData } = useGetConsultationFeesQuery({});

  const consultationFee = useMemo(
    () => resolveConsultationFee(consultationFeesData),
    [consultationFeesData],
  );

  const formInitial = useMemo(
    () => ({
      ...baseInitial,
      charges: is_edit ? '' : consultationFee,
    }),
    [consultationFee, is_edit],
  );

  useEffect(() => {
    if (isServiceSuccess) {
      formik_ref?.current?.setFieldValue(
        'service_category_id',
        data?.data?.service_category?.id,
      );
      formik_ref?.current?.setFieldValue('title', data?.data?.title);
      formik_ref?.current?.setFieldValue('charges', data?.data?.charges);
      formik_ref?.current?.setFieldValue(
        'description',
        data?.data?.description,
      );
      formik_ref?.current?.setFieldValue('image', data?.data?.image);
    }
  }, [isServiceSuccess, data]);

  const goToMyServices = () => {
    if (!params?.service_id) {
      dispatch(bumpServiceStack());
    }
    navigateToMyServicesTab();
  };

  useEffect(() => {
    if (isSuccess) {
      showOkModal(
        {
          type: 'success',
          title: 'Successfully',
          message: params?.service_id
            ? 'Service Has Been Updated Successfully'
            : 'New Service Has Been Added Successfully',
        },
        goToMyServices,
        goToMyServices,
      );
    }
  }, [isSuccess, params]);

  useEffect(() => {
    if (image) {
      formik_ref?.current?.setFieldValue('image', image);
    }
  }, [image]);

  useEffect(() => {
    if (!isFocused || is_edit || didResetNewFormRef.current) return;
    didResetNewFormRef.current = true;
    formik_ref?.current?.resetForm({ values: formInitial });
  }, [isFocused, is_edit, params?.id, formInitial]);

  useEffect(() => {
    if (is_edit || !consultationFee) return;
    formik_ref?.current?.setFieldValue('charges', consultationFee);
  }, [consultationFee, is_edit]);

  const onSubmit = (values: any) => {
    let payload = {
      ...values,
      charges: values.charges || consultationFee,
    };

    if (values?.slots) {
      delete payload.slots;
    }

    if (!params?.service_id) {
      payload.service_category_id = params?.id;
    }
    payload = formHandler(payload);

    if (values?.slots && values?.slots instanceof FormData) {
      const slots_parts = (values.slots as any)._parts;

      slots_parts.forEach(([key, value]) => {
        if (Array.isArray(value) && value.length === 2) {
          payload.append(value[0], value[1]);
        } else {
          payload.append(key, value);
        }
      });
    }

    submit({ id: params?.service_id, body: payload });
  };

  const onManageSlots = () => {
    navigate(ROUTES.SLOTS, {
      onAdd: (data: FormData) => {
        formik_ref?.current?.setFieldValue('slots', data);
        formik_ref?.current?.setFieldTouched('slots', true, false);
      },
    });
  };

  const schema = useMemo(
    () => (is_edit ? ADD_SERVICE_SCHEMA : CREATE_SERVICE_SCHEMA),
    [is_edit],
  );

  return {
    schema,
    refs: {
      formik_ref,
    },
    values: {
      initial: formInitial,
      isLoading,
      is_edit,
    },
    functions: {
      onSubmit,
      openGallery,
      onManageSlots,
    },
  };
};

export default useAddServiceController;
