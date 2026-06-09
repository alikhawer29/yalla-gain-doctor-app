import {
  useIsFocused,
  useRoute,
  useNavigation,
} from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import {
  launchImageLibrary,
  ImageLibraryOptions,
  Asset,
} from 'react-native-image-picker';
import { useModal } from '../../contexts/ModalContext';
import {
  useGetBookingByIdQuery,
  useUpdateAppointmentStatusMutation,
  useUpdatePrescriptionMutation,
  useStartZoomSessionMutation,
  useEndZoomMeetingMutation,
} from '../../redux/Apis/User';
import { mapZoomApiMessage } from '../../utils/mapZoomApiMessage';
import { useAppSelector } from '../../hooks';
import { selectUser } from '../../redux/Slices/AuthSlice';
import { navigate, navigateToProgressTracking } from '../../utils/navigation';
import { parseZoomVideoSession } from '../../utils/parseZoomVideoSession';
import { pickSessionTiming } from '../../utils/sessionCountdown';
import { ROUTES } from '../../utils/routes';
import useToggle from '../../hooks/useToggle';
import { RootStackParamList } from '../../interfaces';
import { RouteProp } from '@react-navigation/native';
import {
  pick,
  types as DocumentTypes,
  errorCodes,
  isErrorWithCode,
  DocumentPickerResponse,
} from '@react-native-documents/picker';

/** Server URLs must not be sent as multipart file parts — only device-picked assets. */
const isLocalUploadUri = (uri: string) => {
  if (!uri || typeof uri !== 'string') return false;
  const u = uri.trim().toLowerCase();
  return !u.startsWith('http://') && !u.startsWith('https://');
};

const formatPrescriptionApiError = (e: any): string => {
  const top = e?.data?.message;
  const errObj = e?.data?.errors;
  if (errObj && typeof errObj === 'object') {
    const lines = Object.values(errObj).flatMap((v: any) =>
      Array.isArray(v) ? v.map(String) : [String(v)],
    );
    if (lines.length) return lines.join('\n');
  }
  return typeof top === 'string' && top.length > 0
    ? top
    : 'Could not save prescription. Please try again.';
};

const useBookingDetailsController = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'BookingDetails'>>();
  const params = route.params;
  const authUser = useAppSelector(selectUser);
  const { showOkModal, showYesNoModal, showInputModal } = useModal();
  const [toggleEditMode, editMode] = useToggle();
  const previousIdRef = useRef<string | number | undefined>(undefined);

  const [prescription, setPrescription] = useState('');
  const [prescriptionFile, setPrescriptionFile] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);

  const { data, refetch, isLoading, isSuccess } = useGetBookingByIdQuery(
    params?.id as string | number,
  );
  const [
    update,
    {
      data: updateData,
      isLoading: isUpdateLoading,
      isSuccess: isUpdateSuccess,
    },
  ] = useUpdateAppointmentStatusMutation();
  const [
    updatePrescription,
    {
      isLoading: isUpdatePrescriptionLoading,
      isSuccess: isUpdatePrescriptionSuccess,
    },
  ] = useUpdatePrescriptionMutation();
  const [startZoomSession] = useStartZoomSessionMutation();
  const [endZoomSession] = useEndZoomMeetingMutation();

  useEffect(() => {
    if (isFocused && params?.id) {
      refetch();
    }
    // Reset loading state when screen comes back into focus (e.g., after ending Zoom meeting)
    // This ensures loading stops when user navigates back from Zoom screen
    if (isFocused) {
      setIsStartingSession(false);
    }
  }, [isFocused]);

  // Listen for navigation focus events to reset loading when returning from Zoom screen
  // This is a backup in case isFocused doesn't trigger properly
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Reset loading state when screen regains focus
      setIsStartingSession(false);
    });

    return unsubscribe;
  }, [navigation]);

  // Also reset loading state on unmount as a safety measure
  useEffect(() => {
    return () => {
      setIsStartingSession(false);
    };
  }, []);

  useEffect(() => {
    if (params?.id && params?.id !== previousIdRef.current) {
      previousIdRef.current = params?.id;
      setPrescriptionFile(null);
      refetch();
    }
  }, [params?.id]);

  useEffect(() => {
    if (isSuccess) {
      setPrescription(
        data?.data?.prescription_text != null
          ? String(data.data.prescription_text)
          : '',
      );
    }
  }, [isSuccess, data]);

  useEffect(() => {
    if (isUpdatePrescriptionSuccess) {
      setPrescriptionFile(null);
      toggleEditMode();
      refetch();
      showOkModal({
        type: 'success',
        title: 'Successfully',
        message: 'Prescription Has Been Saved Successfully.',
      });
    }
  }, [isUpdatePrescriptionSuccess]);

  useEffect(() => {
    if (isUpdateSuccess) {
      if (updateData?.data?.status === 'upcoming') {
        showOkModal({
          type: 'success',
          title: 'Successfully',
          message: 'Appointment Has Been Approved Successfully.',
        });
      } else if (updateData?.data?.status === 'rejected') {
        showOkModal({
          type: 'success',
          title: 'Successfully',
          message: 'Appointment Has Been Rejected Successfully.',
        });
      }

      refetch();
    }
  }, [isUpdateSuccess, updateData]);

  const onApprove = () => {
    showYesNoModal(
      {
        type: 'warning',
        title: 'Approve',
        message: 'Are You Sure You Want To Approve This Appointment?',
      },
      () => update({ type: 'approve', id: data?.data?.id }),
    );
  };

  const onReject = () => {
    showYesNoModal(
      {
        type: 'warning',
        title: 'Reject',
        message: 'Are You Sure You Want To Reject This Appointment?',
      },
      () => {
        showInputModal(
          {
            type: 'warning',
            title: 'Rejection Reason',
            placeholder: 'Write Rejection Reason.....',
            required: true,
          },
          (rejectionReason: string) => {
            update({
              type: 'reject',
              id: data?.data?.id,
              body: { rejection_reason: rejectionReason },
            });
          },
        );
        return false;
      },
    );
  };

  const onReschedule = () => {
    showYesNoModal(
      {
        type: 'warning',
        title: 'Reschedule',
        message: 'Are You Sure You Want To Reschedule This Appointment?',
      },
      () =>
        navigate(
          ROUTES.RESCHEDULE_BOOKING as any,
          { id: data?.data?.id } as any,
        ),
    );
  };

  const onReport = () => {
    navigate(ROUTES.REPORT_BOOKING as any, { id: data?.data?.id } as any);
  };

  const onPickPrescriptionFile = async () => {
    try {
      const res: DocumentPickerResponse[] = await pick({
        allowMultiSelection: false,
        type: [
          DocumentTypes.images,
          DocumentTypes.pdf,
          DocumentTypes.plainText,
          DocumentTypes.doc,
          DocumentTypes.docx,
        ],
      });

      if (!res || res.length === 0) return;

      const file = res[0];

      if (!file.uri) return;

      setPrescriptionFile({
        uri: file.uri,
        name: file.name || 'prescription-file',
        type: file.type || 'application/octet-stream',
      });
    } catch (err) {
      if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
        return;
      }
    }
  };
  const onSavePrescription = async () => {
    if (!data?.data?.id) return;

    const prescriptionText =
      prescription != null && prescription !== undefined
        ? String(prescription)
        : '';
    const trimmed = prescriptionText.trim();

    const hasNewLocalFile =
      prescriptionFile &&
      prescriptionFile.uri &&
      isLocalUploadUri(prescriptionFile.uri);
    const hasExistingServerFile = !!data?.data?.prescription_file;

    // Laravel: prescription_text required_without prescription_file, and inverse.
    // Empty request (no text, no new file, no existing attachment) → both rules fail.
    if (!trimmed && !hasNewLocalFile && !hasExistingServerFile) {
      showOkModal({
        type: 'error',
        title: 'Prescription',
        message:
          'Add prescription text or upload a file. Both cannot be empty.',
      });
      return;
    }

    // Matches Postman/backend: file in request with empty text fails validation.
    if (hasNewLocalFile && !trimmed) {
      showOkModal({
        type: 'error',
        title: 'Prescription',
        message: 'Prescription text is required when uploading a file.',
      });
      return;
    }

    // JSON update without a file field: backend treats file as absent → text required.
    if (!hasNewLocalFile && !trimmed && hasExistingServerFile) {
      showOkModal({
        type: 'error',
        title: 'Prescription',
        message:
          'Prescription text is required while a file is on record. Add text or upload a new file.',
      });
      return;
    }

    try {
      if (hasNewLocalFile) {
        const formData = new FormData();
        formData.append('prescription_text', prescriptionText);
        formData.append('prescription_file', {
          uri: prescriptionFile.uri,
          name: prescriptionFile.name,
          type: prescriptionFile.type,
        } as any);
        await updatePrescription({
          id: data.data.id,
          body: formData,
        }).unwrap();
      } else {
        await updatePrescription({
          id: data.data.id,
          body: { prescription_text: prescriptionText },
        }).unwrap();
      }
    } catch (e: any) {
      showOkModal({
        type: 'error',
        title: 'Prescription',
        message: formatPrescriptionApiError(e),
      });
    }
  };

  const onStartSession = async () => {
    const booking = data?.data;
    const videoSession = booking?.video_session;

    if (!booking?.id) {
      showOkModal({
        type: 'error',
        title: 'Error',
        message: 'Booking ID is missing.',
      });
      return;
    }

    if (!videoSession) {
      showOkModal({
        type: 'error',
        title: 'Video',
        message: 'Video session is not available for this booking.',
      });
      return;
    }

    if (!videoSession.can_start) {
      showOkModal({
        type: 'error',
        title: 'Video',
        message:
          videoSession.status === 'ended'
            ? 'This meeting has already ended.'
            : 'You cannot start this session right now.',
      });
      return;
    }

    setIsStartingSession(true);

    try {
      const startResult = await startZoomSession(booking.id).unwrap();
      const startPayload = (startResult?.data ?? startResult) as Record<
        string,
        unknown
      >;
      const sessionCreds = parseZoomVideoSession(startPayload);
      const sessionTiming = pickSessionTiming(videoSession, startPayload, booking);

      if (!sessionCreds) {
        setIsStartingSession(false);
        showOkModal({
          type: 'error',
          title: 'Error',
          message:
            'Failed to retrieve video session credentials. Please try again.',
        });
        return;
      }

      const userName = [authUser?.first_name, authUser?.last_name]
        .filter(Boolean)
        .join(' ')
        .trim() || 'Doctor';

      const patient = booking?.user;
      const patientName = patient
        ? [patient.first_name, patient.last_name].filter(Boolean).join(' ')
        : undefined;

      navigate(ROUTES.VIDEO_SESSION as any, {
        session_token: sessionCreds.session_token,
        session_name: sessionCreds.session_name,
        user_name: userName,
        role: sessionCreds.role ?? 1,
        doctor_name: userName,
        patient_name: patientName,
        appointment_id: booking.id,
        sdk_key: videoSession.sdk_key,
        session_status: sessionTiming.status ?? videoSession.status,
        duration_minutes: sessionTiming.duration_minutes,
        started_at: sessionTiming.started_at,
        appointment_date: sessionTiming.appointment_date,
        appointment_end_time: sessionTiming.appointment_end_time,
      } as any);

      setTimeout(() => {
        setIsStartingSession(false);
      }, 100);
    } catch (err: any) {
      setIsStartingSession(false);
      console.error('Video session error:', err);
      showOkModal({
        type: 'error',
        title: 'Video Session',
        message: mapZoomApiMessage(err?.data?.message ?? err?.message),
      });
    }
  };

  const onEndSession = () => {
    const booking = data?.data;
    if (!booking?.id) return;

    if (!booking?.video_session?.can_end) {
      showOkModal({
        type: 'error',
        title: 'Video',
        message: 'This session cannot be ended right now.',
      });
      return;
    }

    showYesNoModal(
      {
        type: 'warning',
        title: 'End Session',
        message:
          'End this video session for everyone? The patient will not be able to rejoin.',
      },
      async () => {
        setIsEndingSession(true);
        try {
          await endZoomSession(booking.id).unwrap();
          await refetch();
          showOkModal({
            type: 'success',
            title: 'Session Ended',
            message: 'The video session has ended successfully.',
          });
        } catch (err: any) {
          showOkModal({
            type: 'error',
            title: 'End Session',
            message: mapZoomApiMessage(err?.data?.message ?? err?.message),
          });
        } finally {
          setIsEndingSession(false);
        }
      },
    );
  };

  const onBookingHistory = () => {
    navigate(ROUTES.USER_HISTORY as any, { id: data?.data?.user?.id } as any);
  };

  const onUserProgress = () => {
    navigateToProgressTracking(data?.data?.user?.id);
  };

  const onRefreshBooking = async () => {
    if (!params?.id) return;
    setIsPullRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsPullRefreshing(false);
    }
  };

  return {
    values: {
      data: data?.data || null,
      existingPrescriptionFileUrl: data?.data?.prescription_file ?? null,
      videoSession: data?.data?.video_session ?? null,
      isUpdateLoading:
        isUpdateLoading ||
        isUpdatePrescriptionLoading ||
        isStartingSession ||
        isEndingSession,
      isLoading,
      isRefreshing: isPullRefreshing,
      editMode,
      prescription,
      prescriptionFile,
    },
    functions: {
      onApprove,
      onReject,
      onReschedule,
      onEdit: toggleEditMode,
      onSavePrescription,
      onChangePrescription: setPrescription,
      onStartSession,
      onEndSession,
      onReport,
      onBookingHistory,
      onPickPrescriptionFile,
      onUserProgress,
      onRefreshBooking,
    },
  };
};

export default useBookingDetailsController;
