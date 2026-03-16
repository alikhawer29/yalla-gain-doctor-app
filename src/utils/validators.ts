import * as Yup from 'yup';

export const LOGIN_SCHEMA = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

export const SIGNUP_SCHEMA = Yup.object().shape({
  first_name: Yup.string()
    .required('First Name is required')
    .min(2, 'First Name must be at least 2 characters')
    .max(50, 'First Name cannot exceed 50 characters')
    .matches(
      /^[a-zA-Z\s'-]+$/,
      'First Name can only contain letters, spaces, hyphens, and apostrophes',
    ),
  last_name: Yup.string()
    .required('Last Name is required')
    .min(2, 'Last Name must be at least 2 characters')
    .max(50, 'Last Name cannot exceed 50 characters')
    .matches(
      /^[a-zA-Z\s'-]+$/,
      'Last Name can only contain letters, spaces, hyphens, and apostrophes',
    ),
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required')
    .max(255, 'Email cannot exceed 255 characters'),
  gender: Yup.string()
    .required('Gender is required')
    .oneOf(['male', 'female', 'other'], 'Invalid gender selection'),
  state: Yup.string()
    .required('State is required')
    .min(2, 'State name must be at least 2 characters'),
  city: Yup.string()
    .required('City is required')
    .min(2, 'City name must be at least 2 characters'),
  bio: Yup.string()
    .required('Bio is required')
    .min(10, 'Bio must be at least 10 characters')
    .max(500, 'Bio cannot exceed 500 characters'),
  language: Yup.string().required('Language is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    )
    .required('Password is required'),
  password_confirmation: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm Password is required'),
  dialing_code: Yup.string()
    .required('Dialing code is required')
    .matches(
      /^\+\d{1,4}$/,
      'Dialing code must start with + followed by 1-4 digits',
    ),
  country_code: Yup.string()
    .required('Country code is required')
    .matches(/^[A-Z]{2}$/, 'Invalid country code format'),
  phone: Yup.string()
    .required('Mobile Number is required')
    .matches(/^\d{7,15}$/, 'Phone number must be between 7 and 15 digits')
    .test(
      'phone-length',
      'Phone number length is invalid for selected country',
      function (value) {
        const { country_code } = this.parent;
        if (!value || !country_code) return true;

        // Basic phone length validation by country
        const phoneLengths: { [key: string]: { min: number; max: number } } = {
          AE: { min: 8, max: 12 }, // UAE
          US: { min: 10, max: 10 }, // United States
          GB: { min: 10, max: 11 }, // United Kingdom
          IN: { min: 10, max: 10 }, // India
          PK: { min: 10, max: 11 }, // Pakistan
          SA: { min: 9, max: 9 }, // Saudi Arabia
          KW: { min: 8, max: 8 }, // Kuwait
          QA: { min: 8, max: 8 }, // Qatar
          OM: { min: 8, max: 8 }, // Oman
          BH: { min: 8, max: 8 }, // Bahrain
        };

        const lengthRule = phoneLengths[country_code];
        if (lengthRule) {
          return (
            value.length >= lengthRule.min && value.length <= lengthRule.max
          );
        }

        return true; // Allow any length for unknown countries
      },
    ),
  photo: Yup.mixed()
    .nullable()
    .test(
      'file-type',
      'Profile picture must be an image file (JPG, PNG, or GIF)',
      value => {
        if (!value) return true; // Photo is optional
        if (value instanceof File) {
          return ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(
            value.type,
          );
        }
        if (typeof value === 'object' && value !== null && 'uri' in value) {
          // For React Native image picker objects
          return true; // Assume it's valid if it comes from image picker
        }
        return false;
      },
    )
    .test('file-size', 'Profile picture size must be less than 5MB', value => {
      if (!value || !(value instanceof File)) return true;
      return value.size <= 5 * 1024 * 1024; // 5MB
    }),
  experience: Yup.array()
    .of(
      Yup.object().shape({
        experience: Yup.string()
          .required('Experience is required')
          .min(1, 'Experience must be at least 1 character')
          .max(100, 'Experience cannot exceed 100 characters'),
        specialization: Yup.string()
          .required('Specialization is required')
          .min(2, 'Specialization must be at least 2 characters')
          .max(100, 'Specialization cannot exceed 100 characters'),
      }),
    )
    .min(1, 'At least one experience entry is required'),

  certificates: Yup.array()
    .of(
      Yup.object().shape({
        institute_name: Yup.string()
          .required('Institute name is required')
          .min(2, 'Institute name must be at least 2 characters')
          .max(100, 'Institute name cannot exceed 100 characters'),
        certificate_title: Yup.string()
          .required('Certificate title is required')
          .min(2, 'Certificate title must be at least 2 characters')
          .max(100, 'Certificate title cannot exceed 100 characters'),
        certificate_picture: Yup.mixed()
          .nullable()
          .required('Certificate picture is required')
          .test(
            'file-type',
            'Certificate must be an image file (JPG, PNG, or GIF)',
            value => {
              if (!value) return false;
              if (value instanceof File) {
                return [
                  'image/jpeg',
                  'image/jpg',
                  'image/png',
                  'image/gif',
                ].includes(value.type);
              }
              if (
                typeof value === 'object' &&
                value !== null &&
                'uri' in value
              ) {
                return true; // Assume it's valid if it comes from image picker
              }
              return false;
            },
          )
          .test(
            'file-size',
            'Certificate file size must be less than 10MB',
            value => {
              if (!value || !(value instanceof File)) return true;
              return value.size <= 10 * 1024 * 1024; // 10MB
            },
          ),
      }),
    )
    .min(1, 'At least one certificate entry is required'),
});

export const EDIT_PROFILE_SCHEMA = Yup.object().shape({
  first_name: Yup.string()
    .required('First Name is required')
    .min(2, 'First Name must be at least 2 characters')
    .max(50, 'First Name cannot exceed 50 characters')
    .matches(
      /^[a-zA-Z\s'-]+$/,
      'First Name can only contain letters, spaces, hyphens, and apostrophes',
    ),
  last_name: Yup.string()
    .required('Last Name is required')
    .min(2, 'Last Name must be at least 2 characters')
    .max(50, 'Last Name cannot exceed 50 characters')
    .matches(
      /^[a-zA-Z\s'-]+$/,
      'Last Name can only contain letters, spaces, hyphens, and apostrophes',
    ),
  dialing_code: Yup.string()
    .required('Dialing code is required')
    .matches(
      /^\+\d{1,4}$/,
      'Dialing code must start with + followed by 1-4 digits',
    ),
  country_code: Yup.string()
    .required('Country code is required')
    .matches(/^[A-Z]{2}$/, 'Invalid country code format'),
  phone: Yup.string()
    .required('Mobile Number is required')
    .matches(/^\d{7,15}$/, 'Phone number must be between 7 and 15 digits')
    .test(
      'phone-length',
      'Phone number length is invalid for selected country',
      function (value) {
        const { country_code } = this.parent;
        if (!value || !country_code) return true;

        // Basic phone length validation by country
        const phoneLengths: { [key: string]: { min: number; max: number } } = {
          AE: { min: 8, max: 12 }, // UAE
          US: { min: 10, max: 10 }, // United States
          GB: { min: 10, max: 11 }, // United Kingdom
          IN: { min: 10, max: 10 }, // India
          PK: { min: 10, max: 11 }, // Pakistan
          SA: { min: 9, max: 9 }, // Saudi Arabia
          KW: { min: 8, max: 8 }, // Kuwait
          QA: { min: 8, max: 8 }, // Qatar
          OM: { min: 8, max: 8 }, // Oman
          BH: { min: 8, max: 8 }, // Bahrain
        };

        const lengthRule = phoneLengths[country_code];
        if (lengthRule) {
          return (
            value.length >= lengthRule.min && value.length <= lengthRule.max
          );
        }

        return true; // Allow any length for unknown countries
      },
    ),
  gender: Yup.string()
    .required('Gender is required')
    .oneOf(['male', 'female', 'other'], 'Invalid gender selection'),
  state: Yup.string()
    .required('State is required')
    .min(2, 'State name must be at least 2 characters'),
  city: Yup.string()
    .required('City is required')
    .min(2, 'City name must be at least 2 characters'),
  bio: Yup.string()
    .required('Bio is required')
    .min(10, 'Bio must be at least 10 characters')
    .max(500, 'Bio cannot exceed 500 characters'),
  language: Yup.string().required('Language is required'),
  photo: Yup.mixed()
    .nullable()
    .test(
      'file-type',
      'Profile picture must be an image file (JPG, PNG, or GIF)',
      value => {
        if (!value) return true; // Photo is optional
        if (value instanceof File) {
          return ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(
            value.type,
          );
        }
        if (typeof value === 'object' && value !== null && 'uri' in value) {
          // For React Native image picker objects
          return true; // Assume it's valid if it comes from image picker
        }
        return false;
      },
    )
    .test('file-size', 'Profile picture size must be less than 5MB', value => {
      if (!value || !(value instanceof File)) return true;
      return value.size <= 5 * 1024 * 1024; // 5MB
    }),
  experience: Yup.array()
    .of(
      Yup.object().shape({
        experience: Yup.string()
          .required('Experience is required')
          .min(1, 'Experience must be at least 1 character')
          .max(100, 'Experience cannot exceed 100 characters'),
        specialization: Yup.string()
          .required('Specialization is required')
          .min(2, 'Specialization must be at least 2 characters')
          .max(100, 'Specialization cannot exceed 100 characters'),
      }),
    )
    .min(1, 'At least one experience entry is required'),
  certificates: Yup.array()
    .of(
      Yup.object().shape({
        institute_name: Yup.string()
          .required('Institute name is required')
          .min(2, 'Institute name must be at least 2 characters')
          .max(100, 'Institute name cannot exceed 100 characters'),
        certificate_title: Yup.string()
          .required('Certificate title is required')
          .min(2, 'Certificate title must be at least 2 characters')
          .max(100, 'Certificate title cannot exceed 100 characters'),
        certificate_picture: Yup.mixed()
          .nullable()
          .required('Certificate picture is required')
          .test(
            'file-type',
            'Certificate must be an image file (JPG, PNG, or GIF)',
            value => {
              if (!value) return false;
              if (value instanceof File) {
                return [
                  'image/jpeg',
                  'image/jpg',
                  'image/png',
                  'image/gif',
                ].includes(value.type);
              }
              if (
                typeof value === 'object' &&
                value !== null &&
                'uri' in value
              ) {
                return true; // Assume it's valid if it comes from image picker
              }
              return false;
            },
          )
          .test(
            'file-size',
            'Certificate file size must be less than 10MB',
            value => {
              if (!value || !(value instanceof File)) return true;
              return value.size <= 10 * 1024 * 1024; // 10MB
            },
          ),
      }),
    )
    .min(1, 'At least one certificate entry is required'),
});

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
});

export const VERIFY_CODE_SCHEMA = Yup.object().shape({
  token: Yup.string()
    .required('Verification Code is required')
    .length(4, 'Verification Code must be 4 digit'),
});

export const SET_PASSWORD_SCHEMA = Yup.object().shape({
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  password_confirmation: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm Password is required'),
});

export const CHANGE_PASSWORD_SCHEMA = Yup.object().shape({
  old_password: Yup.string().required('Current Password is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('New Password is required'),
  password_confirmation: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm Password is required'),
});

export const ADD_SERVICE_SCHEMA = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required'),
  charges: Yup.string().required('Charges are required'),
  image: Yup.mixed()
    .test('file-or-url', 'Image is required', value => {
      return (
        value instanceof File ||
        (typeof value === 'string' && value.startsWith('http')) ||
        (typeof value === 'object' &&
          value !== null &&
          'uri' in value &&
          (value as any).uri) ||
        (typeof value === 'string' && value)
      );
    })
    .required('Image is required'),
});

export const EXERCISE_SCHEMA = Yup.object().shape({
  exercise: Yup.string().required('Exercise is required'),
});

export const RESCHEDULE_BOOOKING_SCHEMA = Yup.object().shape({
  rescheduled_appointment_date: Yup.string().required('Date is required'),
  rescheduled_appointment_start_time: Yup.string().required(
    'From Time is required',
  ),
  rescheduled_appointment_end_time: Yup.string().required(
    'To Time is required',
  ),
});

export const REPORT_BOOOKING_SCHEMA = Yup.object().shape({
  reason: Yup.string().required('Reason is required'),
});
