import { UseQueryOptions } from '@tanstack/react-query';

export const retriableActivityQueryOptions = {
  retry: (failureCount: number, error: Error) =>
    error?.name === 'AbortError' || error?.name === 'CanceledError' ? failureCount < 2 : false,
} satisfies Partial<UseQueryOptions>;
