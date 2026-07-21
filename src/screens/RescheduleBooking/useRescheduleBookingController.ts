import { useRoute } from "@react-navigation/native"
import { useEffect, useRef } from "react"
import { useModal } from "../../contexts/ModalContext"
import { useUpdateAppointmentStatusMutation } from "../../redux/Apis/User"
import { RESCHEDULE_BOOOKING_SCHEMA } from "../../utils/validators"
import { getDeviceTimezone } from "../../utils/device"
import { goBack } from "../../utils/navigation"
import { formatTime } from "../../utils/helper"

const initial = {
    rescheduled_appointment_date: "",
    rescheduled_appointment_start_time: "",
    rescheduled_appointment_end_time: ""
}

const useRescheduleBookingController = () => {

    const formik_ref = useRef(null)
    const { params } = useRoute()
    const { showOkModal } = useModal()

    const [update, { isLoading, isSuccess, error }] = useUpdateAppointmentStatusMutation()

    useEffect(() => {
        if (isSuccess) {
            showOkModal({
                type: "success",
                title: "Successfully",
                message: "Booking Has Been Rescheduled Successfully."
            }, () => goBack(), () => goBack())
        }
    }, [isSuccess])

    const onSubmit = (data) => {

        let payload = { ...data }

        payload.rescheduled_appointment_start_time = formatTime(payload.rescheduled_appointment_start_time)
        payload.rescheduled_appointment_end_time = formatTime(payload.rescheduled_appointment_end_time)
        payload.timezone = getDeviceTimezone()

        update({ type: "reschedule", id: params?.id, body: payload })
    }

    return {
        schema: RESCHEDULE_BOOOKING_SCHEMA,
        refs: {
            formik_ref
        },
        values: {
            initial,
            isLoading
        },
        functions: {
            onSubmit
        }
    }
}

export default useRescheduleBookingController