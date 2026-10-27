import type { Query } from '@tanstack/react-query';
import axios from 'axios';
import { type ZodError } from 'zod';

export function formatQueryZodErrors(error: ZodError, query: Query<unknown, unknown, unknown>) {
  return [
    'schema_fail',
    {
      query: query.queryKey[0],
      hash: query.queryHash,
      error: JSON.stringify(error.issues),
    },
  ];
}

export const leatherQueryAxiosInstance = axios;
