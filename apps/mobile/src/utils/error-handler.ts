import 'react-native-gesture-handler';

import * as Sentry from '@sentry/react-native';

// Custom error handler to catch global JS errors
export function errorHandler(error: Error | string) {
  // Send the error to Sentry
  Sentry.captureException(error);

  // Re-throw the error to maintain the original error stack trace
  if (error instanceof Error) {
    throw error;
  }

  throw new Error(error);
}
