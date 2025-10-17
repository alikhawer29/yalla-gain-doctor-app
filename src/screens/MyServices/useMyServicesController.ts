import { useIsFocused } from "@react-navigation/native"
import { useGetMyServicesQuery } from "../../redux/Apis/User"
import { navigate } from "../../utils/navigation"
import { NAVIGATORS, ROUTES } from "../../utils/routes"
import { useEffect } from "react"

const useMyServicesController = () => {

    const isFocused = useIsFocused()
    const { data, isLoading, refetch } = useGetMyServicesQuery({})

    useEffect(() => {
        if (isFocused) {
            refetch()
        }
    }, [isFocused])

    const onPressCard = (id: number, title: string) => {
        navigate(NAVIGATORS.SERVICE_STACK, { screen: ROUTES.SERVICE_DETAILS, params: { id, title } })
    }

    return {
        values: {
            data: data?.data || [],
            isLoading
        },
        functions: {
            onReload: refetch,
            onPressCard
        }
    }
}

export default useMyServicesController