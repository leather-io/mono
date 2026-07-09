import type { QueryFunctionContext, UseQueryOptions } from '@tanstack/react-query';

import {
  type AddressComplianceCheckResult,
  type UserSettings,
  getComplianceService,
} from '@leather.io/services';
import { fiveMinInMs, oneWeekInMs } from '@leather.io/utils';

import { createServiceQueryKey } from '../shared/query-key.factory';

export function createAddressComplianceCheckQueryKey(address: string, settings: UserSettings) {
  return createServiceQueryKey('compliance-service--check-address-compliance', [address], settings);
}

export function createAddressComplianceCheckQueryConfig(address: string, settings: UserSettings) {
  return {
    queryKey: createAddressComplianceCheckQueryKey(address, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getComplianceService().checkAddressCompliance(address, signal),
    staleTime: oneWeekInMs,
    gcTime: oneWeekInMs,
    refetchInterval: query =>
      query.state.data?.status === 'unavailable' ? fiveMinInMs : oneWeekInMs,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  } satisfies UseQueryOptions<AddressComplianceCheckResult, Error>;
}
