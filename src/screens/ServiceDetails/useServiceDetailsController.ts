import { RouteProp, useIsFocused, useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useLayoutEffect } from "react";
import { useModal } from "../../contexts/ModalContext";
import { AppStackParamList } from "../../interfaces";
import { useDeleteMyServiceMutation, useGetMyServicesQuery } from "../../redux/Apis/User";
import { goBack, navigate } from "../../utils/navigation";
import { ROUTES } from "../../utils/routes";

type ServiceDetailsRouteProp = RouteProp<AppStackParamList, 'ServiceDetails'>;

const useServiceDetailsController = () => {

    const isFocused = useIsFocused()
    const navigation = useNavigation()
    const { params } = useRoute<ServiceDetailsRouteProp>()

    const { data, isFetching: isLoading, refetch } = useGetMyServicesQuery({ id: params?.id }, { skip: !params?.id })
    const [deleteService, { isSuccess: isDeleteSuccess, isLoading: isDeleteLoading }] = useDeleteMyServiceMutation()

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

    useEffect(() => {
        if (isDeleteSuccess) {
            showOkModal({
                type: "success",
                title: "Successfully",
                message: "Service Has Been Removed Successfully.",
            }, () => goBack(), () => goBack())
        }
    }, [isDeleteSuccess])

    const onRemove = () => {
        showYesNoModal({
            title: "Remove?",
            message: `Are You Sure You Want To Remove Service "${data?.data?.title}"?`,
        }, () => {
            deleteService(params?.id)
        })
    }

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