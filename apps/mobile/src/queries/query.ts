import { QueryClient } from '@tanstack/react-query';
import { HttpStatusCode, isAxiosError } from 'axios';

const RETRY_LIMIT = 5;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => isRetryableError(error) && failureCount <= RETRY_LIMIT,
      gcTime: 1,
    },
  },
});

function isRetryableError(error: Error): boolean {
  if (!isAxiosError(error)) return false;
  if (!error.response) return true;
  const status = error.response.status;

  return (
    status >= 500 ||
    status === HttpStatusCode.RequestTimeout ||
    status === HttpStatusCode.TooManyRequests
  );
}
