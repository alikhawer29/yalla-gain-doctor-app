import { useIsFocused, useRoute } from "@react-navigation/native"
import { useEffect } from "react"
import { useGetBookingHistoryQuery } from "../../redux/Apis/User"
import { navigate } from "../../utils/navigation"
import { ROUTES } from "../../utils/routes"
import useSearch from "../../hooks/useSearch"

const useUserHistoryController = () => {

    const isFocused = useIsFocused()
    const { params } = useRoute()
    const { search, debouncedSearch, onChange: onSearch } = useSearch()

    const { data, refetch, isLoading } = useGetBookingHistoryQuery({ id: params?.id, search: debouncedSearch })

    useEffect(() => {
        if (isFocused) {
            refetch()
        }
    }, [isFocused])

    const onPressCard = (id: number) => {
        navigate(ROUTES.BOOKING_DETAILS, { id })
    }

    return {
        values: {
            data: data || null,
            isLoading,
            search
        },
        functions: {
            onReload: refetch,
            onPressCard,
            onSearch
        },
    }

}

export default useUserHistoryController