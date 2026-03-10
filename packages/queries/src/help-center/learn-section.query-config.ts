import type { QueryFunctionContext, UseQueryOptions } from '@tanstack/react-query';

import { type ResolvedLearnItem, fetchLearnSection } from '@leather.io/cms';
import { minutesInMs } from '@leather.io/utils';

const learnSectionQueryOptions = {
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  retryOnMount: false,
  staleTime: minutesInMs(60),
  gcTime: minutesInMs(60),
} satisfies Partial<UseQueryOptions>;

type LearnSectionKey = 'extension-tokens' | 'extension-collectibles' | 'mobile-home';

export function createLearnSectionQueryKey(key: LearnSectionKey) {
  return ['learn-section', key] as const;
}

export function createLearnSectionQueryConfig(key: LearnSectionKey) {
  return {
    queryKey: createLearnSectionQueryKey(key),
    queryFn: ({ signal }: QueryFunctionContext) => fetchLearnSection(key, signal),
    ...learnSectionQueryOptions,
  } satisfies UseQueryOptions<ResolvedLearnItem[] | null, Error>;
}
