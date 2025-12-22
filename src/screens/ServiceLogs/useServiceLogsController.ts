import { useIsFocused } from "@react-navigation/native"
import { useEffect, useState } from "react"
import { CommonActions } from "@react-navigation/native"
import useSearch from "../../hooks/useSearch"
import { useGetBookingsQuery } from "../../redux/Apis/User"
import { STATUSES } from "../../utils/data"
import { navigationRef } from "../../utils/navigation"
import { NAVIGATORS, ROUTES } from "../../utils/routes"

const useServiceLogsController = () => {

    const isFocused = useIsFocused()
    const [selected, setSelected] = useState(STATUSES[0]?.value)

    const { search, debouncedSearch, onChange: onSearch } = useSearch()

    const { data, isFetching: isLoading, refetch } = useGetBookingsQuery({ type: selected === "all" ? "" : selected, search: debouncedSearch })

    useEffect(() => {
        if (isFocused) {
            refetch()
        }
    }, [isFocused])

    const onPressCard = (id: number) => {
        if (navigationRef.isReady()) {
            navigationRef.navigate(NAVIGATORS.BOOKING_STACK, { screen: ROUTES.BOOKING_DETAILS, params: { id } })
        }
    }

    const onRequests = () => {
        if (navigationRef.isReady()) {
            navigationRef.navigate(ROUTES.BOOKING_STACK)
        }
    }

    const onChangeStatus = (status: string) => setSelected(status)

    return {
        values: {
            data: data?.data || [],
            isLoading,
            selected,
            search
        },
        functions: {
            onReload: refetch,
            onPressCard,
            onRequests,
            onChangeStatus,
            onSearch
        }
    }
}

export default useServiceLogsController