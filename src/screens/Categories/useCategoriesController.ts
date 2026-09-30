import useSearch from "../../hooks/useSearch"
import { useRefreshOnScreenFocus } from "../../hooks/useRefreshOnScreenFocus"
import { useGetServiceCategoriesQuery } from "../../redux/Apis/User"

const useCategoriesController = () => {

    const { search, debouncedSearch, onChange: onSearch } = useSearch()

    const { data, refetch, isLoading } = useGetServiceCategoriesQuery(
        debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {},
    )

    useRefreshOnScreenFocus(refetch)

    return {
        values: {
            data: data?.data || [],
            isLoading,
            search,
        },
        functions: {
            onReload: refetch,
            onSearch,
        },
    }
}

export default useCategoriesController
