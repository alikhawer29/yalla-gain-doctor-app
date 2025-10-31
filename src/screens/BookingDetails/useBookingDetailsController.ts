import { useIsFocused, useRoute } from "@react-navigation/native"
import { useEffect, useState } from "react"
import { useModal } from "../../contexts/ModalContext"
import { useGetBookingByIdQuery, useUpdateAppointmentStatusMutation, useUpdatePrescriptionMutation } from "../../redux/Apis/User"
import { navigate } from "../../utils/navigation"
import { ROUTES } from "../../utils/routes"
import useToggle from "../../hooks/useToggle"

const useBookingDetailsController = () => {

    const isFocused = useIsFocused()
    const { params } = useRoute()
    const { showOkModal, showYesNoModal } = useModal()
    const [toggleEditMode, editMode] = useToggle()

    const [prescription, setPrescription] = useState("")

    const { data, refetch, isLoading, isSuccess } = useGetBookingByIdQuery(params?.id)

    const [update, { data: updateData, isLoading: isUpdateLoading, isSuccess: isUpdateSuccess }] = useUpdateAppointmentStatusMutation()
    const [updatePrescription, { isLoading: isUpdatePrescriptionLoading, isSuccess: isUpdatePrescriptionSuccess }] = useUpdatePrescriptionMutation()

    useEffect(() => {
        if (isFocused) {
            refetch()
        }
    }, [isFocused])

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
        }, () => update({ type: "reject", id: data?.data?.id, body: { rejection_reason: "Lorem ipsum dolor set amet." } }))
    }

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

    const onStartSession = () => {
        if (data?.data?.status === "upcoming") {
            showOkModal({
                type: "error",
                title: "Alert",
                message: "The session can only be started once the scheduled date and time arrive. Please check your booking details."
            })
        }
    }

    const onBookingHistory = () => {
        navigate(ROUTES.USER_HISTORY, { id: data?.data?.user?.id })
    }

    return {
        values: {
            data: data?.data || null,
            isUpdateLoading: isUpdateLoading || isUpdatePrescriptionLoading,
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