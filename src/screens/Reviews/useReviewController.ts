import { useState } from "react"
import { useGetReviewsQuery } from "../../redux/Apis/User"
import { RATINGS } from "../../utils/data"

const useReviewController = () => {

    const [selected, setSelected] = useState(RATINGS[0]?.value)

    const { data, isLoading, refetch } = useGetReviewsQuery({ rating: selected === "all" ? "" : selected })

    return {
        values: {
            data: data || [],
            selected,
            isLoading
        },
        functions: {
            onChangeStatus: setSelected,
            onReload: refetch
        }
    }
}

export default useReviewController