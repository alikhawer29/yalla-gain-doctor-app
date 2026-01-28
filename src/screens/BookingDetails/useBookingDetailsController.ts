import { useIsFocused, useRoute, useNavigation } from "@react-navigation/native"
import { useEffect, useRef, useState } from "react"
import { launchImageLibrary, ImageLibraryOptions, Asset } from "react-native-image-picker"
import { useModal } from "../../contexts/ModalContext"
import { useGetBookingByIdQuery, useUpdateAppointmentStatusMutation, useUpdatePrescriptionMutation, useCreateZoomMeetingMutation, useLazyGetZoomDetailsQuery } from "../../redux/Apis/User"
import { navigate } from "../../utils/navigation"
import { ROUTES } from "../../utils/routes"
import useToggle from "../../hooks/useToggle"
import { RootStackParamList } from "../../interfaces"
import { RouteProp } from "@react-navigation/native"

const useBookingDetailsController = () => {

    const isFocused = useIsFocused()
    const navigation = useNavigation()
    const route = useRoute<RouteProp<RootStackParamList, 'BookingDetails'>>()
    const params = route.params
    const { showOkModal, showYesNoModal, showInputModal } = useModal()
    const [toggleEditMode, editMode] = useToggle()
    const previousIdRef = useRef< string | number | undefined>(undefined)

    const [prescription, setPrescription] = useState("")
    const [prescriptionFile, setPrescriptionFile] = useState<{ uri: string; name: string; type: string } | null>(null)
    const [isStartingSession, setIsStartingSession] = useState(false)

    const { data, refetch, isLoading, isSuccess } = useGetBookingByIdQuery(params?.id as string | number)
    // Use lazy query to prevent auto-fetching - only fetch when explicitly needed (when starting session)
    // This prevents "Meeting not created yet" errors from showing automatically
    const [getZoomDetails, { isLoading: isFetchingZoomDetails }] = useLazyGetZoomDetailsQuery()

    const [update, { data: updateData, isLoading: isUpdateLoading, isSuccess: isUpdateSuccess }] = useUpdateAppointmentStatusMutation()
    const [updatePrescription, { isLoading: isUpdatePrescriptionLoading, isSuccess: isUpdatePrescriptionSuccess }] = useUpdatePrescriptionMutation()
    const [createZoomMeeting, { isLoading: isCreatingZoomMeeting }] = useCreateZoomMeetingMutation()

    useEffect(() => {
        if (isFocused && params?.id) {
            refetch()
        }
        // Reset loading state when screen comes back into focus (e.g., after ending Zoom meeting)
        // This ensures loading stops when user navigates back from Zoom screen
        if (isFocused) {
            setIsStartingSession(false)
        }
    }, [isFocused])
    
    // Listen for navigation focus events to reset loading when returning from Zoom screen
    // This is a backup in case isFocused doesn't trigger properly
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            // Reset loading state when screen regains focus
            setIsStartingSession(false)
        })
        
        return unsubscribe
    }, [navigation])
    
    // Also reset loading state on unmount as a safety measure
    useEffect(() => {
        return () => {
            setIsStartingSession(false)
        }
    }, [])

    useEffect(() => {
        if (params?.id && params?.id !== previousIdRef.current) {
            previousIdRef.current = params?.id
            refetch()
        }
    }, [params?.id])

    useEffect(() => {
        if (isSuccess) {
            setPrescription(data?.data?.prescription_text)
        }
    }, [isSuccess, data])

    useEffect(() => {
        if (isUpdatePrescriptionSuccess) {
            toggleEditMode()
            refetch()
            showOkModal({
                type: "success",
                title: "Successfully",
                message: "Prescription Has Been Saved Successfully."
            })
        }
    }, [isUpdatePrescriptionSuccess])

    useEffect(() => {
        if (isUpdateSuccess) {
            if (updateData?.data?.status === "upcoming") {
                showOkModal({
                    type: "success",
                    title: "Successfully",
                    message: "Appointment Has Been Approved Successfully."
                })
            } else if (updateData?.data?.status === "rejected") {
                showOkModal({
                    type: "success",
                    title: "Successfully",
                    message: "Appointment Has Been Rejected Successfully."
                })
            }

            refetch()

        }
    }, [isUpdateSuccess, updateData])

    const onApprove = () => {
        showYesNoModal({
            type: "warning",
            title: "Approve",
            message: "Are You Sure You Want To Approve This Appointment?"
        }, () => update({ type: "approve", id: data?.data?.id }))
    }

    const onReject = () => {
        showYesNoModal({
            type: "warning",
            title: "Reject",
            message: "Are You Sure You Want To Reject This Appointment?"
        }, () => {
            console.log("Yes clicked, showing input modal");
            showInputModal({
                type: "warning",
                title: "Rejection Reason",
                placeholder: "Write Rejection Reason....."
            }, (rejectionReason: string) => {
                console.log("Input modal submitted with reason:", rejectionReason);
                update({ type: "reject", id: data?.data?.id, body: { rejection_reason: rejectionReason } })
            })
        })
    }

    //    const onReject = () => {
    //     showYesNoModal({
    //         type: "warning",
    //         title: "Reject",
    //         message: "Are You Sure You Want To Reject This Appointment?"
    //     }, () => update({ type: "reject", id: data?.data?.id, body: { rejection_reason: "Lorem ipsum dolor set amet." } }))
    // }

    const onReschedule = () => {
        showYesNoModal({
            type: "warning",
            title: "Reschedule",
            message: "Are You Sure You Want To Reschedule This Appointment?"
        }, () => navigate(ROUTES.RESCHEDULE_BOOKING, { id: data?.data?.id }))
    }

    const onReport = () => {
        navigate(ROUTES.REPORT_BOOKING, { id: data?.data?.id })
    }

    const onPickPrescriptionFile = () => {
        const options: ImageLibraryOptions = {
            mediaType: "photo",
            selectionLimit: 1
        }

        launchImageLibrary(options, response => {
            if (response.didCancel) {
                return
            }

            if (response.errorCode) {
                console.log("Prescription file picker error:", response.errorMessage)
                return
            }

            const asset: Asset | undefined = response.assets && response.assets[0]
            if (!asset || !asset.uri) {
                return
            }

            setPrescriptionFile({
                uri: asset.uri,
                name: asset.fileName || "prescription.jpg",
                type: asset.type || "image/jpeg"
            })
        })
    }

    const onSavePrescription = () => {
        if (!data?.data?.id) return

        // If a file is selected, send multipart/form-data with text + file
        if (prescriptionFile) {
            const formData = new FormData()
            formData.append("prescription_text", prescription || "")
            // NOTE: Change "prescription_file" to match your backend field name if different
            formData.append("prescription_file", {
                uri: prescriptionFile.uri,
                name: prescriptionFile.name,
                type: prescriptionFile.type
            } as any)

            updatePrescription({ id: data.data.id, body: formData })
        } else {
            // Text-only prescription
            updatePrescription({ id: data.data.id, body: { prescription_text: prescription } })
        }
    }

    const onStartSession = async () => {
        if (data?.data?.status === "upcoming") {
            showOkModal({
                type: "error",
                title: "Alert",
                message: "The session can only be started once the scheduled date and time arrive. Please check your booking details."
            })
            return
        }

        if (!data?.data?.id) {
            showOkModal({
                type: "error",
                title: "Error",
                message: "Booking ID is missing."
            })
            return
        }

        // Set loading state - this will persist until navigation
        setIsStartingSession(true)

        try {
            // First, try to create the meeting (or get "already created" response)
            let createResult
            try {
                createResult = await createZoomMeeting(data.data.id).unwrap()
            } catch (createError: any) {
                // If meeting already exists, continue to fetch zoom details
                if (createError?.data?.message?.includes("already created") || createError?.data?.status) {
                    createResult = createError.data
                } else {
                    throw createError
                }
            }
            
            // Wait a bit for the meeting to be fully created/ready
            await new Promise<void>(resolve => setTimeout(() => resolve(), 1000))
            
            // Always fetch zoom details to get zak token from zoom_start_url
            // This is required for host to start the meeting
            let zoomDetails
            try {
                const zoomDetailsResult = await getZoomDetails(data.data.id).unwrap()
                zoomDetails = zoomDetailsResult?.data
            } catch (zoomError: any) {
                // If meeting doesn't exist yet, show appropriate error
                if (zoomError?.data?.message?.includes("not created") || zoomError?.data?.message?.includes("Meeting not created")) {
                    setIsStartingSession(false)
                    showOkModal({
                        type: "error",
                        title: "Error",
                        message: "Meeting is being created. Please wait a moment and try again."
                    })
                    return
                }
                throw zoomError
            }
            
            if (!zoomDetails) {
                setIsStartingSession(false)
                showOkModal({
                    type: "error",
                    title: "Error",
                    message: "Failed to fetch Zoom meeting details. Please try again."
                })
                return
            }
            
            // Extract zak token from zoom_start_url (required for host to start meeting)
            const startUrl = zoomDetails.zoom_start_url || zoomDetails.zoom_api?.start_url
            let zakToken: string | undefined
            
            console.log("Zoom Details - startUrl:", startUrl)
            
            if (startUrl) {
                const zakMatch = startUrl.match(/[?&]zak=([^&]+)/)
                if (zakMatch && zakMatch[1]) {
                    zakToken = decodeURIComponent(zakMatch[1])
                    console.log("Zoom Details - ZAK token extracted successfully, length:", zakToken.length)
                } else {
                    console.error("Zoom Details - Failed to extract ZAK token from URL:", startUrl)
                }
            } else {
                console.error("Zoom Details - No start_url found in zoom details")
            }
            
            const meetingNumber = zoomDetails.zoom_meeting_id || zoomDetails.zoom_api?.id
            
            console.log("Zoom Details - Meeting number:", meetingNumber)
            console.log("Zoom Details - Has ZAK token:", !!zakToken)
            
            if (!zakToken) {
                setIsStartingSession(false)
                showOkModal({
                    type: "error",
                    title: "Error",
                    message: "Failed to retrieve Zoom access token (ZAK). Please try again."
                })
                return
            }
            
            if (!meetingNumber) {
                setIsStartingSession(false)
                showOkModal({
                    type: "error",
                    title: "Error",
                    message: "Failed to retrieve Zoom meeting number. Please try again."
                })
                return
            }
            
            // Refetch booking to get sdk_key and signature (needed for SDK initialization)
            const bookingRefetch = await refetch()
            const bookingData = bookingRefetch?.data?.data
            
            if (!bookingData?.sdk_key || !bookingData?.signature) {
                setIsStartingSession(false)
                showOkModal({
                    type: "error",
                    title: "Error",
                    message: "Failed to retrieve Zoom SDK credentials. Please try again."
                })
                return
            }
            
            console.log("Zoom Details - Navigating to Zoom meeting with ZAK token")
            
            // Navigate to Zoom meeting with zak token for host to start
            navigate(ROUTES.ZOOM_MEETING as any, {
                sdk_key: bookingData.sdk_key,
                signature: bookingData.signature,
                meeting_number: String(meetingNumber),
                password: zoomDetails.zoom_password || zoomDetails.zoom_api?.password || "",
                join_url: zoomDetails.zoom_join_url || zoomDetails.zoom_api?.join_url,
                zak_token: zakToken, // ZAK token is required for host to start meeting
                appointment_id: params?.id, // Appointment ID for end meeting API
            } as any)
            
            // Reset loading state after navigation - use setTimeout to ensure navigation completes first
            setTimeout(() => {
                setIsStartingSession(false)
            }, 100)
        } catch (err: any) {
            setIsStartingSession(false)
            console.error("Zoom meeting error:", err)
            showOkModal({
                type: "error",
                title: "Error",
                message: err?.data?.message || err?.message || "Failed to start Zoom meeting. Please try again."
            })
        }
    }

    const onBookingHistory = () => {
        navigate(ROUTES.USER_HISTORY, { id: data?.data?.user?.id })
    }

    return {
        values: {
            data: data?.data || null,
            isUpdateLoading: isUpdateLoading || isUpdatePrescriptionLoading || isCreatingZoomMeeting || isStartingSession,
            isLoading,
            editMode,
            prescription,
            prescriptionFile
        },
        functions: {
            onApprove,
            onReject,
            onReschedule,
            onEdit: toggleEditMode,
            onSavePrescription,
            onChangePrescription: setPrescription,
            onStartSession,
            onReport,
            onBookingHistory,
            onPickPrescriptionFile
        },
    }

}

export default useBookingDetailsController