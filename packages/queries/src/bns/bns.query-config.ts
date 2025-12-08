import type { QueryFunctionContext, UseQueryOptions } from '@tanstack/react-query';

import type { BnsName, BnsProfile } from '@leather.io/models';
import {
  type AccountBnsName,
  type AccountRequest,
  type UserSettings,
  getBnsService,
} from '@leather.io/services';

import { createServiceQueryKey } from '../shared/query-key.factory';

export function createBnsNameQueryKey(fullName: string, settings: UserSettings) {
  return createServiceQueryKey('bns-service--get-bns-name', [fullName], settings);
}

export function createBnsNameQueryConfig(fullName: string, settings: UserSettings) {
  return {
    queryKey: createBnsNameQueryKey(fullName, settings),
    queryFn: ({ signal }: QueryFunctionContext) => getBnsService().getBnsName(fullName, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 3600000,
    gcTime: 3600000,
  } satisfies UseQueryOptions<BnsName | null, Error>;
}

export function createAccountPrimaryBnsProfileQueryKey(
  request: AccountRequest,
  settings: UserSettings
) {
  return createServiceQueryKey(
    'bns-service--get-account-primary-bns-profile',
    [request.account.stacks],
    settings
  );
}

export function createAccountPrimaryBnsProfileQueryConfig(
  request: AccountRequest,
  settings: UserSettings
) {
  return {
    queryKey: createAccountPrimaryBnsProfileQueryKey(request, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getBnsService().getAccountPrimaryBnsProfile(request, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 3600000,
    gcTime: 3600000,
  } satisfies UseQueryOptions<BnsProfile | null, Error>;
}

export function createAccountBnsNamesQueryKey(request: AccountRequest, settings: UserSettings) {
  return createServiceQueryKey(
    'bns-service--get-account-bns-names',
    [request.account.stacks],
    settings
  );
}

export function createAccountBnsNamesQueryConfig(request: AccountRequest, settings: UserSettings) {
  return {
    queryKey: createAccountBnsNamesQueryKey(request, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getBnsService().getAccountBnsNames(request, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 3600000,
    gcTime: 3600000,
  } satisfies UseQueryOptions<AccountBnsName[], Error>;
}
