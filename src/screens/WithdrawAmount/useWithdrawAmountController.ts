import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { selectUser, syncUserCoins } from "../../redux/Slices/AuthSlice"
import { useWithdrawMutation, useGetWalletQuery } from "../../redux/Apis/User"
import { goBack } from "../../utils/navigation"
import { Alert } from "react-native"
import { useModal } from "../../contexts/ModalContext"
import { pickWalletPayload } from "../../utils/walletPayload"

const useWithdrawAmountController = () => {
    const dispatch = useDispatch()
    const user = useSelector(selectUser)
    const [withdraw, { isLoading }] = useWithdrawMutation()
    const { data: walletData, refetch: refetchWallet } = useGetWalletQuery(undefined)
    const { showOkModal } = useModal() as any

    const [form, setForm] = useState({
        amount: "",
        account_holder_name: user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : "",
        country: "US",
        routing_number: "",
        confirm_routing_number: "",
        account_number: "",
        confirm_account_number: "",
        address_line1: user?.address || "",
        postal_code: user?.zip_code || "",
        city: user?.city || "",
        state: user?.state || "",
        dob: user?.dob || "1990-01-01",
        phone: user?.phone || "",
        ssn_last_4: "",
        id_number: "",
        mcc: "8099"
    })

    const [errors, setErrors] = useState<any>({})

    const handleChange = (key: string, value: any) => {
        setForm((prev: any) => ({ ...prev, [key]: value }))
        if (errors[key]) {
            setErrors((prev: any) => {
                const newErrors = { ...prev }
                delete newErrors[key]
                return newErrors
            })
        }
    }

    const validate = () => {
        const newErrors: any = {}
        if (!form.amount) newErrors.amount = "Fund amount is required"
        if (!form.routing_number) newErrors.routing_number = "Routing number is required"
        if (form.routing_number !== form.confirm_routing_number) newErrors.confirm_routing_number = "Routing numbers do not match"
        if (!form.account_number) newErrors.account_number = "Account number is required"
        if (form.account_number !== form.confirm_account_number) newErrors.confirm_account_number = "Account numbers do not match"
        if (!form.address_line1) newErrors.address_line1 = "Address is required"
        if (!form.postal_code) newErrors.postal_code = "Postal code is required"
        if (!form.city) newErrors.city = "City is required"
        if (!form.state) newErrors.state = "State is required"
        if (!form.dob) newErrors.dob = "Date of birth is required"
        if (!form.phone) newErrors.phone = "Phone number is required"
        if (!form.ssn_last_4) newErrors.ssn_last_4 = "SSN Last 4 digits are required"
        if (!form.id_number) newErrors.id_number = "ID number is required"

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        if (!validate()) return

        try {
            const payload = {
                amount: form.amount,
                country: form.country,
                currency: "usd",
                account_holder_name: form.account_holder_name,
                account_holder_type: "individual",
                routing_number: form.routing_number,
                account_number: form.account_number,
                address_line1: form.address_line1,
                postal_code: form.postal_code,
                city: form.city,
                state: form.state,
                dob: form.dob,
                phone: form.phone,
                ssn_last_4: form.ssn_last_4,
                id_number: form.id_number,
                mcc: form.mcc
            }

            await withdraw(payload).unwrap()
            const { data: freshWallet } = await refetchWallet()
            const w = pickWalletPayload(freshWallet)
            const myCoins = w?.my_coins
            if (myCoins != null && myCoins !== "") {
                dispatch(syncUserCoins(myCoins as string | number))
            }
            showOkModal({
                type: 'success',
                title: 'Successfully',
                message: 'Amount Has Been Transfered Successfully'
            }, () => goBack())
        } catch (error: any) {
            Alert.alert("Error", error?.data?.message || "Something went wrong")
        }
    }

    return {
        form,
        errors,
        isLoading,
        walletData,
        handleChange,
        handleSubmit
    }
}

export default useWithdrawAmountController
