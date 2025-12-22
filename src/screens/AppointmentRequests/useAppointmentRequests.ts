import { useIsFocused } from "@react-navigation/native"
import { useEffect, useState } from "react"
import useSearch from "../../hooks/useSearch"
import useToggle from "../../hooks/useToggle"
import { useGetAppointmentRequestsQuery } from "../../redux/Apis/User"
import { REQUEST_STATUSES } from "../../utils/data"
import { navigate } from "../../utils/navigation"
import { ROUTES } from "../../utils/routes"

const useAppointmentRequests = () => {

    const isFocused = useIsFocused()
    const { search, debouncedSearch, onChange: onSearch } = useSearch()
    const [selected, setSelected] = useState(REQUEST_STATUSES[0]?.value)

    const [toggleFilterModal, filterModalVisible] = useToggle()
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')

    const [appliedFilters, setAppliedFilters] = useState({
        from: '',
        to: '',
    })

    const { data, isFetching: isLoading, refetch } = useGetAppointmentRequestsQuery({ 
        type: selected === "all" ? "" : selected, 
        search: debouncedSearch,
        from: appliedFilters.from || undefined,
        to: appliedFilters.to || undefined,
    })

    useEffect(() => {
        if (isFocused) {
            refetch()
        }
    }, [isFocused])

    const onPressCard = (id: number) => {
        navigate(ROUTES.BOOKING_DETAILS, { id })
    }

    const onChangeStatus = (status: string) => setSelected(status)

    const onApplyFilters = () => {
        setAppliedFilters({
            from: fromDate,
            to: toDate,
        })
        toggleFilterModal()
    }

    const onClearFilters = () => {
        setFromDate('')
        setToDate('')
        setAppliedFilters({
            from: '',
            to: '',
        })
        toggleFilterModal()
    }

    return {
        values: {
            data: data?.data || [],
            isLoading,
            search,
            selected,
            filterModalVisible,
            fromDate,
            toDate,
        },
        functions: {
            onReload: refetch,
            onPressCard,
            onSearch,
            onChangeStatus,
            toggleFilterModal,
            setFromDate,
            setToDate,
            onApplyFilters,
            onClearFilters,
        }
    }
}

export default useAppointmentRequests