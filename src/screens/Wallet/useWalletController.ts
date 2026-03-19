import { useSelector } from "react-redux"
import { selectUser } from "../../redux/Slices/AuthSlice"
import { navigate } from "../../utils/navigation"
import { ROUTES } from "../../utils/routes"
import { useGetWalletQuery } from "../../redux/Apis/User"

const useWalletController = () => {
    const user = useSelector(selectUser)
    const { data: walletData, isLoading: isWalletLoading } = useGetWalletQuery(undefined)

    const handleWithdraw = () => {
        navigate(ROUTES.WITHDRAW_AMOUNT)
    }

    return {
        user,
        walletData,
        isWalletLoading,
        handleWithdraw
    }
}

export default useWalletController
