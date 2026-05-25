import { useIsFocused } from "@react-navigation/native"
import { useGetMyServicesQuery } from "../../redux/Apis/User"
import { navigateToServiceDetailsFromMyServices } from "../../utils/navigation"
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
        navigateToServiceDetailsFromMyServices(id, title)
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