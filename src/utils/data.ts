import images from '../assets/images';

/** Backend host (no trailing slash). Single place to switch environments. */
export const SERVER_ORIGIN = 'https://custom-dev.onlinetestingserver.com';
// export const SERVER_ORIGIN = 'http://109.1.1.4';

/** Shared API root (no `doctor_trainer` segment). Used for verify-otp, resend-otp, etc. */
export const YALLA_API_BASE_URL = `${SERVER_ORIGIN}/yalla-backend/api/`;

export const DOCTOR_TRAINER_API_BASE_URL = `${SERVER_ORIGIN}/yalla-backend/api/doctor_trainer/`;

/** Socket.IO server (Node HTTPS on this port). Must match backend `server.listen`. */
export const CHAT_SOCKET_PORT = 2170;

/**
 * Shared secret the socket server checks before broadcasting `receiveUserId`.
 * Must match backend `Signature` in your Node socket file.
 */
export const CHAT_SOCKET_SIGNATURE = '8lW8XtnPDVwHAdXCCoxRROvQUDtf9p2Zlt1HvJSm';

/**
 * Full Socket.IO URL (WSS). REST may stay HTTP while chat uses HTTPS — that is OK.
 */
export const CHAT_SOCKET_URL = `https://custom-dev.onlinetestingserver.com:${CHAT_SOCKET_PORT}`;

/** Matches backend `user.status`: 0 OTP pending, 1 active, 2 pending admin approval, 3 rejected */
export const USER_ACCOUNT_STATUS = {
  INACTIVE: 0,
  ACTIVE: 1,
  PENDING_APPROVAL: 2,
  REJECTED: 3,
} as const;

export const LOGIN_TABS = [
  {
    label: 'Login',
    value: 'login',
  },
  //   {
  //     label: 'Register',
  //     value: 'register',
  //   },
];

export const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo.';

export const GENDERS = [
  {
    label: 'Male',
    value: 'male',
  },
  {
    label: 'Female',
    value: 'female',
  },
];

export const LANGUAGES = [
  {
    label: 'English',
    value: 'english',
  },
  {
    label: 'Arabic',
    value: 'arabic',
  },
];

export const STATUSES = [
  {
    label: 'All',
    value: 'all',
  },
  {
    label: 'Upcoming',
    value: 'upcoming',
  },
  {
    label: 'In-Progress',
    value: 'in-progress',
  },
  {
    label: 'Past',
    value: 'past',
  },
];

export const REQUEST_STATUSES = [
  {
    label: 'All',
    value: 'all',
  },
  {
    label: 'Pending',
    value: 'pending',
  },
  {
    label: 'Rejected',
    value: 'rejected',
  },
  {
    label: 'Rescheduled',
    value: 'rescheduled',
  },
];

export const RATINGS = [
  {
    label: 'All',
    value: 'all',
  },
  {
    label: '5',
    value: '5',
  },
  {
    label: '4',
    value: '4',
  },
  {
    label: '3',
    value: '3',
  },
  {
    label: '2',
    value: '2',
  },
  {
    label: '1',
    value: '1',
  },
];

export const PROGRESS_TRACKING = [
  {
    title: 'Running Progress',
    progress: 90,
    icon: images.run,
  },
  {
    title: 'Fitness Progress',
    progress: 70,
    icon: images.dumbbell,
  },
  {
    title: 'Boxing Progress',
    progress: 40,
    icon: images.kabaddi,
  },
  {
    title: 'Workout Progress',
    progress: 10,
    icon: images.martial_arts,
  },
];

export const AUTH_TYPES = [
  {
    value: 'email',
    image: images.email,
    title: 'Send Via Email',
    description: 'Receive Verification Code via Email',
  },
  {
    value: 'phone',
    image: images.phone,
    title: 'Send Via Phone',
    description: 'Receive Verification Code via Phone Number',
  },
];

export const CHAT_TYPES = [
  {
    label: 'User',
    value: 'user',
  },
  {
    label: 'Trainer',
    value: 'trainer',
  },
  {
    label: 'Doctor',
    value: 'doctor',
  },
];

export const CREATE_POST_OPTIONS = [
  {
    title: 'Video',
    icon: images.video,
  },
  {
    title: 'Photo',
    icon: images.gallery,
  },
  {
    title: 'Polling',
    icon: images.polling,
  },
];
