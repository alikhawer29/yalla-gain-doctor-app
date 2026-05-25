import { RouteProp, useIsFocused, useNavigation, useRoute } from "@react-navigation/native";
import { useCallback, useEffect, useLayoutEffect } from "react";
import { useModal } from "../../contexts/ModalContext";
import { AppStackParamList } from "../../interfaces";
import { useDeleteMyServiceMutation, useGetMyServicesQuery } from "../../redux/Apis/User";
import { navigate, navigateToMyServicesTab } from "../../utils/navigation";
import { ROUTES } from "../../utils/routes";

type ServiceDetailsRouteProp = RouteProp<AppStackParamList, 'ServiceDetails'>;

const useServiceDetailsController = () => {

    const isFocused = useIsFocused()
    const navigation = useNavigation()
    const { params } = useRoute<ServiceDetailsRouteProp>()

    const { data, isFetching: isLoading, refetch } = useGetMyServicesQuery({ id: params?.id }, { skip: !params?.id })
    const [deleteService, { isLoading: isDeleteLoading }] = useDeleteMyServiceMutation()

    const { showOkModal, showYesNoModal } = useModal()

    useEffect(() => {
        if (isFocused) {
            refetch()
        }
    }, [isFocused])

    useLayoutEffect(() => {
        navigation.setOptions({
            title: params?.title || "Service Details"
        })
    }, [params])

    const goToMyServices = useCallback(() => {
        navigateToMyServicesTab()
    }, [])

    const onRemove = useCallback(() => {
        const serviceTitle = data?.data?.title ?? "this service"
        showYesNoModal(
            {
                title: "Remove?",
                message: `Are You Sure You Want To Remove Service "${serviceTitle}"?`,
            },
            async () => {
                try {
                    const result = await deleteService(params?.id).unwrap()
                    const res = result as { status?: boolean | string; message?: string }
                    const failed =
                        res &&
                        typeof res === "object" &&
                        (res.status === false || res.status === "false")
                    if (failed) {
                        const apiMessage =
                            typeof res.message === "string" && res.message.length > 0
                                ? res.message
                                : "This service cannot be deleted."
                        showOkModal({
                            type: "error",
                            title: "Cannot remove service",
                            message: apiMessage,
                        })
                        return
                    }
                    showOkModal(
                        {
                            type: "success",
                            title: "Successfully",
                            message: "Service Has Been Removed Successfully.",
                        },
                        goToMyServices,
                        goToMyServices,
                    )
                } catch (e: any) {
                    const msg =
                        e?.data?.message ||
                        e?.error ||
                        e?.message ||
                        "Something went wrong. Please try again."
                    showOkModal({
                        type: "error",
                        title: "Cannot remove service",
                        message: typeof msg === "string" ? msg : "Something went wrong.",
                    })
                }
            },
        )
    }, [data?.data?.title, deleteService, goToMyServices, params?.id, showOkModal, showYesNoModal])

    const onEdit = () => {
        navigate(ROUTES.ADD_SERVICE, { service_id: params?.id, title: `Edit ${data?.data?.title}` })
    }

    const onEditSlots = () => {
        navigate(ROUTES.SLOTS, { id: params?.id })
    }

    return {
        values: {
            data: data?.data || null,
            isLoading,
            isDeleteLoading,
        },
        functions: {
            onRemove,
            onEdit,
            onEditSlots
        }
    }
}

export default useServiceDetailsController