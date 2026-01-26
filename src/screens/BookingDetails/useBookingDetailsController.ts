import { useIsFocused, useRoute } from "@react-navigation/native"
import { useEffect, useRef, useState } from "react"
import { useModal } from "../../contexts/ModalContext"
import { useGetBookingByIdQuery, useUpdateAppointmentStatusMutation, useUpdatePrescriptionMutation, useCreateZoomMeetingMutation, useGetZoomDetailsQuery } from "../../redux/Apis/User"
import { navigate } from "../../utils/navigation"
import { ROUTES } from "../../utils/routes"
import useToggle from "../../hooks/useToggle"
import { RootStackParamList } from "../../interfaces"
import { RouteProp } from "@react-navigation/native"

const useBookingDetailsController = () => {

    const isFocused = useIsFocused()
    const route = useRoute<RouteProp<RootStackParamList, 'BookingDetails'>>()
    const params = route.params
    const { showOkModal, showYesNoModal, showInputModal } = useModal()
    const [toggleEditMode, editMode] = useToggle()
    const previousIdRef = useRef< string | number | undefined>(undefined)

    const [prescription, setPrescription] = useState("")

    const { data, refetch, isLoading, isSuccess } = useGetBookingByIdQuery(params?.id as string | number)
    const { refetch: refetchZoomDetails } = useGetZoomDetailsQuery(params?.id as number, { skip: !params?.id })

    const [update, { data: updateData, isLoading: isUpdateLoading, isSuccess: isUpdateSuccess }] = useUpdateAppointmentStatusMutation()
    const [updatePrescription, { isLoading: isUpdatePrescriptionLoading, isSuccess: isUpdatePrescriptionSuccess }] = useUpdatePrescriptionMutation()
    const [createZoomMeeting, { isLoading: isCreatingZoomMeeting }] = useCreateZoomMeetingMutation()

    useEffect(() => {
        if (isFocused && params?.id) {
            refetch()
        }
    }, [isFocused])

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

    const onSavePrescription = () => {
        updatePrescription({ id: data?.data?.id, body: { prescription_text: prescription } })
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
            const zoomDetailsResult = await refetchZoomDetails()
            const zoomDetails = zoomDetailsResult?.data?.data
            
            if (!zoomDetails) {
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
                showOkModal({
                    type: "error",
                    title: "Error",
                    message: "Failed to retrieve Zoom access token (ZAK). Please try again."
                })
                return
            }
            
            if (!meetingNumber) {
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
            } as any)
        } catch (err: any) {
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
            isUpdateLoading: isUpdateLoading || isUpdatePrescriptionLoading || isCreatingZoomMeeting,
            isLoading,
            editMode,
            prescription
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
            onBookingHistory
        },
    }

}

export default useBookingDetailsController