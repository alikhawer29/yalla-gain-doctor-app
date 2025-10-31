import { useIsFocused } from "@react-navigation/native"
import { useEffect, useState } from "react"
import useSearch from "../../hooks/useSearch"
import { useGetAppointmentRequestsQuery } from "../../redux/Apis/User"
import { REQUEST_STATUSES } from "../../utils/data"
import { navigate } from "../../utils/navigation"
import { ROUTES } from "../../utils/routes"

const useAppointmentRequests = () => {

    const isFocused = useIsFocused()
    const { search, debouncedSearch, onChange: onSearch } = useSearch()
    const [selected, setSelected] = useState(REQUEST_STATUSES[0]?.value)

    const { data, isFetching: isLoading, refetch } = useGetAppointmentRequestsQuery({ type: selected === "all" ? "" : selected, search: debouncedSearch })

    useEffect(() => {
        if (isFocused) {
            refetch()
        }
    }, [isFocused])

    const onPressCard = (id: number) => {
        navigate(ROUTES.BOOKING_DETAILS, { id })
    }

    const onChangeStatus = (status: string) => setSelected(status)

    return {
        values: {
            data: data?.data || [],
            isLoading,
            search,
            selected
        },
        functions: {
            onReload: refetch,
            onPressCard,
            onSearch,
            onChangeStatus
        }
    }
}

export default useAppointmentRequests