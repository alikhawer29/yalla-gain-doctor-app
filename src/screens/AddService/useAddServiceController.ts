import { RouteProp, useIsFocused, useRoute } from "@react-navigation/native"
import { useEffect, useMemo, useRef } from "react"
import { useModal } from "../../contexts/ModalContext"
import usePicker from "../../hooks/usePicker"
import { RootStackParamList } from "../../interfaces"
import { useCreateServiceCategoryMutation, useGetMyServicesQuery } from "../../redux/Apis/User"
import { useAppDispatch } from "../../hooks"
import { bumpServiceStack } from "../../redux/Slices/NavigationSlice"
import { formHandler } from "../../utils/helper"
import { navigate, navigateToMyServicesTab } from "../../utils/navigation"
import { ROUTES } from "../../utils/routes"
import { ADD_SERVICE_SCHEMA, CREATE_SERVICE_SCHEMA } from "../../utils/validators"

const initial = {
    title: "",
    charges: "",
    description: "",
    image: null,
    slots: null as FormData | null,
}

type AddServiceRouteProp = RouteProp<RootStackParamList, 'AddService'>

const useAddServiceController = () => {

    const dispatch = useAppDispatch()
    const isFocused = useIsFocused()
    const { image, openGallery } = usePicker()
    const { showOkModal } = useModal()
    const formik_ref = useRef(null)
    const didResetNewFormRef = useRef(false)
    const { params } = useRoute<AddServiceRouteProp>()
    const is_edit = !!params?.service_id

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
        if (!params?.service_id) {
            dispatch(bumpServiceStack())
        }
        navigateToMyServicesTab()
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

    useEffect(() => {
        if (!isFocused || is_edit || didResetNewFormRef.current) return
        didResetNewFormRef.current = true
        formik_ref?.current?.resetForm({ values: { ...initial } })
    }, [isFocused, is_edit, params?.id])

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
        navigate(ROUTES.SLOTS, {
            onAdd: (data: FormData) => {
                formik_ref?.current?.setFieldValue('slots', data)
                formik_ref?.current?.setFieldTouched('slots', true, false)
            },
        })
    }

    const schema = useMemo(
        () => (is_edit ? ADD_SERVICE_SCHEMA : CREATE_SERVICE_SCHEMA),
        [is_edit],
    )

    return {
        schema,
        refs: {
            formik_ref
        },
        values: {
            initial,
            isLoading,
            is_edit
        },
        functions: {
            onSubmit,
            openGallery,
            onManageSlots
        }
    }
}

export default useAddServiceController