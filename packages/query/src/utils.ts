import { Query, QueryKey } from '@tanstack/react-query';
import { ZodError } from 'zod';

export function formatQueryZodErrors(
  error: ZodError,
  query: Query<unknown, unknown, unknown, QueryKey>
) {
  return [
    'schema_fail',
    {
      query: query.queryKey[0],
      hash: query.queryHash,
      error: JSON.stringify(error.issues),
    },
  ];
}
