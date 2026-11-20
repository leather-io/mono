import type { QueryFunctionContext, UseQueryOptions } from '@tanstack/react-query';

import {
  type OnramperWidgetSignature,
  getOnramperWidgetSignatureClient,
} from '@leather.io/services';

export const onramperWidgetSignatureQueryPrefix = 'onramper-widget-signature';

export function createOnramperWidgetSignatureQueryKey(params: Record<string, string>) {
  return [onramperWidgetSignatureQueryPrefix, params] as const;
}

export function createOnramperWidgetSignatureQueryConfig(params: Record<string, string>) {
  return {
    queryKey: createOnramperWidgetSignatureQueryKey(params),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getOnramperWidgetSignatureClient().signWidgetParams(params, signal),
    gcTime: 0,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  } satisfies UseQueryOptions<OnramperWidgetSignature>;
}
