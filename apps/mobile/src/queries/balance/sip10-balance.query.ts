import { toFetchState } from '@/components/loading/fetch-state';
import { useAccountAddresses, useTotalAccountAddresses } from '@/hooks/use-account-addresses';
import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { AccountRequest, Sip10Balance, getSip10BalancesService } from '@leather.io/services';
import {
  createSip10AccountBalanceQueryConfig,
  createSip10AggregateBalanceQueryConfig,
} from '@leather.io/queries';
import { getAssetId } from '@leather.io/utils';

import { balanceQueryOptions } from './balance-query-options';
import { useUserSettings } from './use-user-settings';

export function useSip10TotalBalance() {
  const accounts = useTotalAccountAddresses();
  return toFetchState(useSip10AggregateBalanceQuery(accounts.map(account => ({ account }))));
}

export function useSip10AccountBalance(
  fingerprint: string,
  accountIndex: number,
  options?: {
    includeHiddenAssets?: boolean;
  }
) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  const queryResult = useSip10AccountBalanceQuery({
    account,
    assets: { includeHiddenAssets: options?.includeHiddenAssets },
  });

  return toFetchState(queryResult);
}

export function useManagedSip10Tools(fingerprint: string, accountIndex: number) {
  const enabledSip10s = useSip10AccountBalance(fingerprint, accountIndex);

  return {
    isEnabled: (token: Sip10Balance) =>
      !!enabledSip10s.value?.sip10s.find(sip10 => {
        return getAssetId(sip10.asset).id === getAssetId(token.asset).id;
      }),
  };
}

export function useSip10BalanceByAssetId(
  fingerprint: string,
  accountIndex: number,
  assetId: string
) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(useSip10BalanceByAssetIdQuery({ account }, assetId));
}

export function useSip10BalanceByContractId(
  fingerprint: string,
  accountIndex: number,
  contractId: string
) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(useSip10BalanceByContractIdQuery({ account }, contractId));
}

function useSip10AggregateBalanceQuery(requests: AccountRequest[]) {
  const settings = useUserSettings();
  return useQuery({
    ...createSip10AggregateBalanceQueryConfig(requests, settings),
    ...balanceQueryOptions,
  });
}

export function useSip10AccountBalanceQuery(request: AccountRequest) {
  const settings = useUserSettings();
  return useQuery({
    ...createSip10AccountBalanceQueryConfig(request, settings),
    ...balanceQueryOptions,
  });
}

function useSip10BalanceByAssetIdQuery(request: AccountRequest, assetId: string) {
  const settings = useUserSettings();
  return useQuery({
    queryKey: [
      'sip10-balances-service-get-sip10-balance-by-asset-id',
      assetId,
      request,
      settings.quoteCurrency,
    ],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getSip10BalancesService().getSip10BalanceByAssetId(request, assetId, signal),
    ...balanceQueryOptions,
  });
}

function useSip10BalanceByContractIdQuery(request: AccountRequest, contractId: string) {
  const settings = useUserSettings();
  return useQuery({
    queryKey: [
      'sip10-balances-service-get-sip10-balance-by-contract-id',
      contractId,
      request,
      settings.quoteCurrency,
    ],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getSip10BalancesService().getSip10BalanceByContractId(request, contractId, signal),
    ...balanceQueryOptions,
  });
}
