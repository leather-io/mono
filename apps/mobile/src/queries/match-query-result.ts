import { ReactElement } from 'react';

import { UseQueryResult } from '@tanstack/react-query';

import { assertUnreachable } from '@leather.io/utils';

interface Matchers<TData, TError> {
  pending: () => ReactElement;
  error: (error: TError) => ReactElement;
  success: (data: TData) => ReactElement;
}

export function matchQueryResult<TData, TError>(
  queryResult: UseQueryResult<TData, TError>,
  { error, pending, success }: Matchers<TData, TError>
) {
  switch (queryResult.status) {
    case 'pending':
      return pending();
    case 'error':
      return error(queryResult.error);
    case 'success':
      return success(queryResult.data);
    default:
      return assertUnreachable(queryResult);
  }
}
