import * as Yup from "yup"

export const LOGIN_SCHEMA = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('Password is required'),
})

export const SIGNUP_SCHEMA = Yup.object().shape({
    first_name: Yup.string().required('First Name is required'),
    last_name: Yup.string().required('Last Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    gender: Yup.string().required('Gender is required'),
    state: Yup.string().required('State is required'),
    city: Yup.string().required('City is required'),
    bio: Yup.string().required('Bio is required'),
    language: Yup.string().required('Language is required'),
    password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('Password is required'),
    password_confirmation: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Confirm Password is required'),
    dialing_code: Yup.string(),
    country_code: Yup.string(),
    phone: Yup.string().required('Mobile Number is required'),
    photo: Yup.mixed()
        .nullable(),
    experience: Yup.array()
        .of(
            Yup.object().shape({
                experience: Yup.string().required('Experience is required'),
                specialization: Yup.string().required('Specialization is required'),
            })
        )
        .min(1, 'At least one experience entry is required'),

    certificates: Yup.array()
        .of(
            Yup.object().shape({
                institute_name: Yup.string().required('Institute name is required'),
                certificate_title: Yup.string().required('Certificate title is required'),
                certificate_picture: Yup.mixed()
                    .nullable()
                    .required('Certificate picture is required'),
            })
        )
        .min(1, 'At least one certificate entry is required'),
})

export const EDIT_PROFILE_SCHEMA = Yup.object().shape({
    first_name: Yup.string().required('First Name is required'),
    last_name: Yup.string().required('Last Name is required'),
    dialing_code: Yup.string(),
    country_code: Yup.string(),
    phone: Yup.string().required('Mobile Number is required'),
    gender: Yup.string().required('Gender is required'),
    state: Yup.string().required('State is required'),
    city: Yup.string().required('City is required'),
    bio: Yup.string().required('Bio is required'),
    language: Yup.string().required('Language is required'),
    photo: Yup.mixed()
        .nullable(),
    experience: Yup.array()
        .of(
            Yup.object().shape({
                experience: Yup.string().required('Experience is required'),
                specialization: Yup.string().required('Specialization is required'),
            })
        )
        .min(1, 'At least one experience entry is required'),
    certificates: Yup.array()
        .of(
            Yup.object().shape({
                institute_name: Yup.string().required('Institute name is required'),
                certificate_title: Yup.string().required('Certificate title is required'),
                certificate_picture: Yup.mixed()
                    .nullable()
                    .required('Certificate picture is required'),
            })
        )
        .min(1, 'At least one certificate entry is required')
})

export const FORGOT_PASSWORD_SCHEMA = Yup.object().shape({
    via: Yup.string().oneOf(['email', 'phone']).required('Method is required'),
    email: Yup.string().when('via', {
        is: 'email',
        then: schema => schema.required('Email is required').email('Invalid email'),
        otherwise: schema => schema.notRequired(),
    }),
    phone: Yup.string().when('via', {
        is: 'phone',
        then: schema => schema.required('Phone is required'),
        otherwise: schema => schema.notRequired(),
    }),
    dialing_code: Yup.string().when('via', {
        is: 'phone',
        then: schema => schema.required('Dialing code is required'),
        otherwise: schema => schema.notRequired(),
    }),
})

export const VERIFY_CODE_SCHEMA = Yup.object().shape({
    token: Yup.string().required('Verification Code is required').length(4, "Verification Code must be 4 digit")
})

export const SET_PASSWORD_SCHEMA = Yup.object().shape({
    password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('Password is required'),
    password_confirmation: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Confirm Password is required'),
})

export const CHANGE_PASSWORD_SCHEMA = Yup.object().shape({
    old_password: Yup.string()
        .required('Current Password is required'),
    password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('New Password is required'),
    password_confirmation: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Confirm Password is required'),
})

export const ADD_SERVICE_SCHEMA = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    charges: Yup.string().required('Charges are required'),
    image: Yup.mixed()
        .test('file-or-url', 'Image is required', value => {
            return (
                (value instanceof File) ||
                (typeof value === 'string' && value.startsWith('http'))
            );
        })
        .required('Image is required')
})

export const EXERCISE_SCHEMA = Yup.object().shape({
    exercise: Yup.string().required('Exercise is required')
})

export const RESCHEDULE_BOOOKING_SCHEMA = Yup.object().shape({
    rescheduled_appointment_date: Yup.string().required('Date is required'),
    rescheduled_appointment_start_time: Yup.string().required('From Time is required'),
    rescheduled_appointment_end_time: Yup.string().required('To Time is required'),
})

export const REPORT_BOOOKING_SCHEMA = Yup.object().shape({
    reason: Yup.string().required('Reason is required'),
})