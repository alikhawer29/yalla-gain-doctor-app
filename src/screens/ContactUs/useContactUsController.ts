import { useState } from "react"
import { useContactUsMutation } from "../../redux/Apis/User"
import { useModal } from "../../contexts/ModalContext"
import { goBack } from "../../utils/navigation"
import { Alert } from "react-native"

const useContactUsController = () => {
    const [contact, { isLoading }] = useContactUsMutation()
    const { showOkModal } = useModal() as any

    const [form, setForm] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    })

    const [errors, setErrors] = useState<any>({})

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
