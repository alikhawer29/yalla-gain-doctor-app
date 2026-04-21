import images from '../assets/images';

/** Backend host (no trailing slash). Single place to switch environments. */
// export const SERVER_ORIGIN = 'https://custom-dev.onlinetestingserver.com';
export const SERVER_ORIGIN = 'http://109.1.1.7';

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

export const USER = {
  first_name: 'John',
  last_name: 'Elbert',
  email: 'john.elbert@gmail.com',
  phone: '(646) 000-0000',
  dob: '10/07/2025',
  language: 'English',
  unique_code: 'AB#092178',
  image: images.dummy,
  role: 'User',
};

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

export const RECOMMENDED_VIDEOS = [
  {
    title: 'Morning Stretch Routine',
    description:
      'A gentle 10-minute stretch session to wake up your body and boost flexibility.',
    created_at: '30/06/2025',
    language: 'English',
    image: images.recommended_videos.exercise_one,
  },
  {
    title: 'Beginner Strength Training',
    description:
      'A simple strength workout to help beginners build muscle with minimal equipment.',
    created_at: '30/06/2025',
    language: 'English',
    image: images.recommended_videos.exercise_two,
  },
  {
    title: 'Cardio Burn Workout',
    description:
      'A 25-minute cardio routine to improve stamina and burn calories effectively.',
    created_at: '30/06/2025',
    language: 'English',
    image: images.recommended_videos.exercise_one,
  },
  {
    title: 'Entrenamiento de abdominales en casa',
    description:
      'Rutina rápida de abdominales para fortalecer tu core sin necesidad de equipo.',
    created_at: '30/06/2025',
    language: 'Spanish',
    image: images.recommended_videos.exercise_two,
  },
  {
    title: 'Séance de récupération active',
    description:
      'Un entraînement léger pour favoriser la récupération et réduire les douleurs musculaires.',
    created_at: '30/06/2025',
    language: 'French',
    image: images.recommended_videos.exercise_one,
  },
];

export const WORKOUT_PLANS = [
  {
    title: 'Daily Cardio Blast',
    description: 'Fitness Goal: Muscle Building',
    image: images.workout.workout_one,
    schedule: 'Daily',
    progress: 60,
    duration: '30 mins',
    helper_text: 'Keep your heart rate up and push through!',
  },
  {
    title: 'Full-Body Strength Builder',
    description: 'Fitness Goal: Muscle Building',
    image: images.workout.workout_two,
    schedule: 'Weekly',
    progress: 35,
    duration: '45 mins',
    helper_text: 'Focus on form, not speed. Strength comes with consistency.',
  },
  {
    title: 'Morning Mobility Flow',
    description: 'Fitness Goal: Muscle Building',
    image: images.workout.workout_one,
    schedule: 'Daily',
    progress: 80,
    duration: '20 mins',
    helper_text: 'Start your day loose and limber!',
  },
  {
    title: 'Core Focus Challenge',
    description: 'Fitness Goal: Muscle Building',
    image: images.workout.workout_two,
    schedule: 'Weekly',
    progress: 50,
    duration: '40 mins',
    helper_text: 'Engage your core throughout. Every rep counts!',
  },
  {
    title: 'Evening Wind-Down Yoga',
    description: 'Fitness Goal: Muscle Building',
    image: images.workout.workout_two,
    schedule: 'Daily',
    progress: 90,
    duration: '25 mins',
    helper_text: 'Breathe deeply. Let go of the day’s stress.',
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

export const NEWSFEED = [
  {
    user: USER,
    content: LOREM,
    reaction_count: 60,
    comment_count: 60,
  },
  {
    user: USER,
    content: LOREM,
    media: images.workout.workout_one,
    reaction_count: 60,
    comment_count: 60,
  },
  {
    user: USER,
    content: LOREM,
    media: images.workout.workout_one,
    reaction_count: 60,
    comment_count: 60,
  },
];

export const CHATS = [
  {
    message: LOREM,
    created_at: '3 DAYS AGO',
    system: true,
  },
  {
    user: USER,
    message: LOREM,
    created_at: '3 DAYS AGO',
  },
  {
    user: USER,
    message: LOREM,
    created_at: '3 DAYS AGO',
  },
  {
    user: USER,
    message: LOREM,
    media: images.workout.workout_one,
    created_at: '3 DAYS AGO',
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
