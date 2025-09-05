/**
 * Utility to handle React Query errors, especially AbortErrors
 */

export function isAbortError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === 'AbortError' ||
      error.message?.includes('aborted') ||
      error.message?.includes('cancelled'))
  );
}

export function handleQueryError(error: unknown): never {
  // Don't propagate AbortErrors - let React Query handle them silently
  if (isAbortError(error)) {
    console.debug('Query aborted - this is expected behavior');
    throw error; // React Query will handle this properly
  }

  // Log other errors for debugging
  if (error instanceof Error) {
    console.error('Query error:', error.message, error.stack);
  }

  throw error;
}

/**
 * Wraps query functions to handle AbortErrors gracefully
 */
export function createQueryFunction<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>
) {
  return async (...args: TArgs): Promise<TReturn> => {
    try {
      return await fn(...args);
    } catch (error) {
      return handleQueryError(error);
    }
  };
}

/**
 * Query configuration defaults that help prevent AbortError issues
 */
export const STABLE_QUERY_CONFIG = {
  staleTime: 30 * 1000, // 30 seconds
  gcTime: 5 * 60 * 1000, // 5 minutes
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
  refetchOnMount: true,
  retryOnMount: false,
  retry: (failureCount: number, error: unknown) => {
    if (isAbortError(error)) return false;
    return failureCount < 3;
  },
} as const;

/**
 * Converts React Query error (unknown) to Error | null for toFetchState
 */
export function convertQueryError(error: unknown): Error | null {
  if (error instanceof Error) {
    return error;
  }
  if (typeof error === 'string') {
    return new Error(error);
  }
  if (error != null) {
    return new Error('Unknown error occurred');
  }
  return null;
}

/**
 * Enhanced toFetchState that handles React Query results properly
 */
export function queryToFetchState<T>(queryResult: {
  data?: T;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
}) {
  return {
    data: queryResult.data,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: convertQueryError(queryResult.error),
  };
}
