import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useContactUsMutation } from "../../redux/Apis/User"
import { selectUser } from "../../redux/Slices/AuthSlice"
import { useModal } from "../../contexts/ModalContext"
import { goBack } from "../../utils/navigation"
import { Alert } from "react-native"

const buildNameFromUser = (user: { first_name?: string; last_name?: string } | null) =>
    user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : ""

const useContactUsController = () => {
    const user = useSelector(selectUser)
    const [contact, { isLoading }] = useContactUsMutation()
    const { showOkModal } = useModal() as any

    const [form, setForm] = useState({
        name: buildNameFromUser(user),
        email: user?.email || "",
        subject: "",
        message: ""
    })

    const [errors, setErrors] = useState<any>({})

    useEffect(() => {
        if (!user?.id) return
        const name = buildNameFromUser(user)
        setForm(prev => ({
            ...prev,
            name: prev.name || name,
            email: prev.email || user.email || "",
        }))
    }, [user?.id])

    const handleChange = (key: string, value: string) => {
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
        if (!form.name) newErrors.name = "Full Name is required"
        if (!form.email) {
            newErrors.email = "Email Address is required"
        } else if (!/\S+@\S+\.\S+/.test(form.email)) {
            newErrors.email = "Invalid email address"
        }
        if (!form.subject) newErrors.subject = "Subject is required"
        if (!form.message) newErrors.message = "Message is required"

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        if (!validate()) return

        try {
            await contact(form).unwrap()
            showOkModal({
                type: 'success',
                title: 'Successfully',
                message: 'Your request has been submitted successfully'
            }, () => goBack())
        } catch (error: any) {
            Alert.alert("Error", error?.data?.message || "Something went wrong")
        }
    }

    return {
        form,
        errors,
        isLoading,
        handleChange,
        handleSubmit
    }
}

export default useContactUsController
