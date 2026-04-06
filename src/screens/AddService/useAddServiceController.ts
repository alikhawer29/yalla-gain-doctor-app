import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { useEffect, useLayoutEffect, useRef } from "react"
import { useModal } from "../../contexts/ModalContext"
import usePicker from "../../hooks/usePicker"
import { RootStackParamList } from "../../interfaces"
import { useCreateServiceCategoryMutation, useGetMyServicesQuery } from "../../redux/Apis/User"
import { formHandler } from "../../utils/helper"
import { navigate } from "../../utils/navigation"
import { NAVIGATORS, ROUTES } from "../../utils/routes"
import { ADD_SERVICE_SCHEMA } from "../../utils/validators"

const initial = {
    title: "",
    charges: "",
    description: "",
    image: null
}

type AddServiceRouteProp = RouteProp<RootStackParamList, 'AddService'>

const useAddServiceController = () => {

    const navigation = useNavigation()
    const { image, openGallery } = usePicker()
    const { showOkModal } = useModal()
    const formik_ref = useRef(null)
    const { params } = useRoute<AddServiceRouteProp>()

    const { data, isSuccess: isServiceSuccess } = useGetMyServicesQuery({ id: params?.service_id }, { skip: !params?.service_id })
    const [submit, { isLoading, isSuccess }] = useCreateServiceCategoryMutation()

    useEffect(() => {
        if (isServiceSuccess) {
            formik_ref?.current?.setFieldValue("service_category_id", data?.data?.service_category?.id)
            formik_ref?.current?.setFieldValue("title", data?.data?.title)
            formik_ref?.current?.setFieldValue("charges", data?.data?.charges)
            formik_ref?.current?.setFieldValue("description", data?.data?.description)
            formik_ref?.current?.setFieldValue('image', data?.data?.image)
        }
    }, [isServiceSuccess, data])

    const goToMyServices = () => {
        navigate(
            NAVIGATORS.BOTTOM as any,
            {
                screen: NAVIGATORS.MY_SERVICES_STACK,
                params: { screen: ROUTES.MY_SERVICES },
            } as any,
        )
    }

    useEffect(() => {
        if (isSuccess) {
            showOkModal({
                type: "success",
                title: "Successfully",
                message: params?.service_id ? "Service Has Been Updated Successfully" : "New Service Has Been Added Successfully",
            }, goToMyServices, goToMyServices)
        }
    }, [isSuccess, params])

    useEffect(() => {
        if (image) {
            formik_ref?.current?.setFieldValue('image', image)
        }
    }, [image])

    const onSubmit = (values: any) => {

        let payload = { ...values }

        if (values?.slots) {
            delete payload.slots
        }

        if (!params?.service_id) {
            payload.service_category_id = params?.id
        }
        payload = formHandler(payload)

        if (values?.slots && values?.slots instanceof FormData) {

            const slots_parts = (values.slots as any)._parts

            slots_parts.forEach(([key, value]) => {
                if (Array.isArray(value) && value.length === 2) {
                    payload.append(value[0], value[1])
                } else {
                    payload.append(key, value)
                }
            })

        }

        submit({ id: params?.service_id, body: payload })
    }

    const onManageSlots = () => {
        navigate(ROUTES.SLOTS, { onAdd: (data) => formik_ref?.current?.setFieldValue('slots', data) })
    }

    return {
        schema: ADD_SERVICE_SCHEMA,
        refs: {
            formik_ref
        },
        values: {
            initial,
            isLoading,
            is_edit: !!params?.service_id
        },
        functions: {
            onSubmit,
            openGallery,
            onManageSlots
        }
    }
}

export default useAddServiceController