import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { useModal } from "../../contexts/ModalContext"
import { useDeleteProfileMutation } from "../../redux/Apis/User"
import { logout } from "../../redux/Slices/AuthSlice"

const useMyProfileController = () => {

    const dispatch = useDispatch()
    const { showYesNoModal, showOkModal } = useModal()

    const [deleteAccount, { isLoading: isProfileDeleteLoading, isSuccess: isProfileDeleteSuccess }] = useDeleteProfileMutation()

    useEffect(() => {
        if (isProfileDeleteSuccess) {
            showOkModal({
                type: "success",
                title: "Successfully",
                message: "Account Has Been Deleted Successfully"
            }, () => dispatch(logout()), () => dispatch(logout()))
        }
    }, [isProfileDeleteSuccess])

    const onPressDeleteAccount = () => {
        showYesNoModal({
            title: "Delete Account",
            message: "Are You Sure You Want To Delete Your Account? You Will Not Be Able To Retrieve Your Data After Deletion"
        }, deleteAccount)
    }

    return {
        values: {
            isProfileDeleteLoading
        },
        functions: {
            onPressDeleteAccount
        }
    }
}

export default useMyProfileController