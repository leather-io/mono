import type { QueryFunctionContext, UseQueryOptions } from '@tanstack/react-query';

import { type HelpCenterCategory, fetchHelpCenterCategories } from '@leather.io/services';
import { minutesInMs } from '@leather.io/utils';

const helpCenterQueryOptions = {
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  retryOnMount: false,
  staleTime: minutesInMs(60),
  gcTime: minutesInMs(60),
} satisfies Partial<UseQueryOptions>;

export function createHelpCenterCategoriesQueryKey() {
  return ['help-center--categories'] as const;
}

export function createHelpCenterCategoriesQueryConfig() {
  return {
    queryKey: createHelpCenterCategoriesQueryKey(),
    queryFn: ({ signal }: QueryFunctionContext) => fetchHelpCenterCategories(signal),
    ...helpCenterQueryOptions,
  } satisfies UseQueryOptions<HelpCenterCategory[], Error>;
}
