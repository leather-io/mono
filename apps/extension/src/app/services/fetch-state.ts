interface LoadingState<T> {
  state: 'loading';
  value?: T;
  errorMessage?: string;
}

interface ErrorState<T> {
  state: 'error';
  errorMessage: string;
  value?: T;
}

interface SuccessState<T> {
  state: 'success';
  value: T;
  errorMessage?: string;
}

export type FetchState<T> = LoadingState<T> | ErrorState<T> | SuccessState<T>;

export function toFetchState<T>({
  data,
  isLoading,
  isError,
  error,
}: {
  data?: T;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}): FetchState<T> {
  if (isLoading) {
    return { state: 'loading' };
  }
  if (isError) {
    return {
      state: 'error',
      errorMessage: error?.message ?? '',
    };
  }
  if (!data) {
    return {
      state: 'error',
      errorMessage: '',
    };
  }
  return {
    state: 'success',
    value: data,
  };
}
