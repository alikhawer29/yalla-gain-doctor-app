import { useRoute } from "@react-navigation/native"
import { useEffect, useRef } from "react"
import { useModal } from "../../contexts/ModalContext"
import { useUpdateAppointmentStatusMutation } from "../../redux/Apis/User"
import { goBack } from "../../utils/navigation"
import { REPORT_BOOOKING_SCHEMA } from "../../utils/validators"

const initial = {
    reason: ""
}

const useReportBookingController = () => {

    const formik_ref = useRef(null)
    const { params } = useRoute()
    const { showOkModal } = useModal()

    const [update, { isLoading, isSuccess }] = useUpdateAppointmentStatusMutation()

    useEffect(() => {
        if (isSuccess) {
            showOkModal({
                type: "success",
                title: "Successfully",
                message: "Booking Has Been Reported. Your Report Against This Booking Has Been Submitted To The Admin."
            }, () => goBack(), () => goBack())
        }
    }, [isSuccess])

    const onSubmit = (data) => {

        let payload = { ...data }
        update({ type: "report", id: params?.id, body: payload })
    }

    return {
        schema: REPORT_BOOOKING_SCHEMA,
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

export default useReportBookingController