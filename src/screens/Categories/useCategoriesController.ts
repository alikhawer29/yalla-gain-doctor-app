import { useGetServiceCategoriesQuery } from "../../redux/Apis/User"

const useCategoriesController = () => {

    const { data, refetch, isLoading } = useGetServiceCategoriesQuery({})

    return {
        values: {
            data: data?.data || [],
            isLoading
        },
        functions: {
            onReload: refetch
        }
    }
}

export default useCategoriesController