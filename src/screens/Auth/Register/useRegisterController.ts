import { RouteProp, useRoute } from "@react-navigation/native";
import { useCallback, useEffect, useRef } from "react";
import { useModal } from "../../../contexts/ModalContext";
import usePicker from "../../../hooks/usePicker";
import { AuthStackParamList } from "../../../interfaces";
import { useSignupMutation } from "../../../redux/Apis/Auth";
import { capitalize, formHandler, getCities, getStates } from "../../../utils/helper";
import { navigateAndSimpleReset } from "../../../utils/navigation";
import { ROUTES } from "../../../utils/routes";
import { SIGNUP_SCHEMA } from "../../../utils/validators";

type RegisterRouteProp = RouteProp<AuthStackParamList, 'Register'>

const initial = {
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirmation: "",
    dialing_code: "+971",
    country_code: "AE",
    phone: "",
    language: "",
    state: "",
    city: "",
    bio: "",
    gender: "",
    photo: null,
    experience: [{ experience: "", specialization: "" }],
    certificates: [{ institute_name: "", certificate_title: "", certificate_picture: null }]
}

// const initial = {
//     first_name: "Omar",
//     last_name: "Khalid",
//     email: "omar.khalid@yopmail.com",
//     password: "12345678",
//     password_confirmation: "12345678",
//     dialing_code: "+971",
//     country_code: "AE",
//     phone: "509843233",
//     gender: "male",
//     language: "english",
//     state: "Dubai",
//     city: "Dubai",
//     bio: "Dedicated wellness coach helping clients achieve fitness goals through strength training and mindful nutrition.",
//     photo: null,
//     experience: [
//         { experience: "6 years", specialization: "Strength Training" },
//         { experience: "3 years", specialization: "Nutrition Planning" }
//     ],
//     certificates: [
//         {
//             institute_name: "WellFit Academy",
//             certificate_title: "Certified Fitness Instructor",
//             certificate_picture: null
//         },
//         {
//             institute_name: "MindBody Institute",
//             certificate_title: "Advanced Nutrition Certification",
//             certificate_picture: null
//         }
//     ]
// }

const useRegisterController = () => {

    const { openGallery } = usePicker()

    const formik_ref = useRef(null)
    const { params } = useRoute<RegisterRouteProp>()

    const { showOkModal } = useModal()

    const [submit, { isSuccess, isLoading }] = useSignupMutation()

    useEffect(() => {
        if (isSuccess) {
            showOkModal({
                type: "success",
                title: "Successfully",
                message: "Your information has been successfully sent to the admin. After approval, you will receive a confirmation notification. Until then, you can log in, but your services will not be live until you receive approval."
            }, () => navigateAndSimpleReset(ROUTES.USER_ENTRY))
        }
    }, [isSuccess])

    const onSubmit = useCallback((data: any) => {
        let payload = { ...data }
        payload.source = params.type
        payload = formHandler(payload)
        submit(payload)
    }, [params])

    const onPressBackToLogin = useCallback(() => {
        navigateAndSimpleReset(ROUTES.USER_ENTRY)
    }, [])

    const tabs = [
        { label: `Register As ${capitalize(params.type)}`, value: "register" },
    ]

    return {
        refs: {
            formik_ref
        },
        schema: SIGNUP_SCHEMA,
        values: {
            initial,
            isLoading,
            states: getStates(),
            cities: getCities,
            tabs
        },
        functions: {
            onSubmit,
            onPressBackToLogin,
            openGallery
        }
    }

}

export default useRegisterController