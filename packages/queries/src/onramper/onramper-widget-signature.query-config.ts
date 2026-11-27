import type { QueryFunctionContext, UseQueryOptions } from '@tanstack/react-query';

import { type LeatherApiOnramperWidgetSignature, getLeatherApiClient } from '@leather.io/services';

export const onramperWidgetSignatureQueryPrefix = 'onramper-widget-signature';

export function createOnramperWidgetSignatureQueryKey(params: Record<string, string>) {
  return [onramperWidgetSignatureQueryPrefix, params] as const;
}

export function createOnramperWidgetSignatureQueryConfig(params: Record<string, string>) {
  return {
    queryKey: createOnramperWidgetSignatureQueryKey(params),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getLeatherApiClient().signOnramperWidgetParams(params, { signal }),
    gcTime: 0,
    staleTime: Infinity,
    meta: { persist: false },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  } satisfies UseQueryOptions<LeatherApiOnramperWidgetSignature>;
}
