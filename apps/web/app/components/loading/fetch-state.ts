export type FetchState<T> =
  | {
      state: 'loading';
    }
  | {
      state: 'success';
      value: T;
    }
  | {
      state: 'error';
      errorMessage: string;
    };

function getErrorMessage(error: unknown) {
  if (!error) {
    return '';
  }

  if (error instanceof Error) {
    return error.message ?? '';
  }

  if (typeof error === 'string') {
    return error;
  }

  if (typeof error === 'object') {
    const maybeMessage = (error as { message?: unknown }).message;
    if (typeof maybeMessage === 'string') {
      return maybeMessage;
    }
    try {
      return JSON.stringify(error);
    } catch {
      const errorWithToString = error as { toString?: () => string };
      if (
        typeof errorWithToString.toString === 'function' &&
        errorWithToString.toString !== Object.prototype.toString
      ) {
        return errorWithToString.toString();
      }
      return 'Unknown error';
    }
  }

  return JSON.stringify(error);
}

export function toFetchState<T>({
  data,
  isLoading,
  isError,
  error,
}: {
  data: T | undefined | null;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
}) {
  if (isLoading) {
    return { state: 'loading' } as const;
  }
  if (isError) {
    return {
      state: 'error',
      errorMessage: getErrorMessage(error),
    } as const;
  }
  if (data === undefined || data === null) {
    return {
      state: 'error',
      errorMessage: '',
    } as const;
  }
  return {
    state: 'success',
    value: data,
  } as const;
}
