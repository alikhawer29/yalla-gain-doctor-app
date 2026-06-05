import { isRejectedWithValue } from '@reduxjs/toolkit';
import Toast from 'react-native-toast-message';

const errorLogger = () => next => action => {
  if (isRejectedWithValue(action)) {
    const message =
      action?.payload?.data?.message ||
      action?.error?.message ||
      'Something went wrong';

    // Skip toast while video session is still being provisioned on the server
    const lower = message?.toLowerCase() ?? '';
    if (
      lower.includes('meeting not created yet') ||
      lower.includes('session not created')
    ) {
      return next(action);
    }

    console.log('Error Message :: ', message);

    Toast.show({ text1: 'Error!', text2: message, type: 'error' });
  }

  return next(action);
};

export default errorLogger;
