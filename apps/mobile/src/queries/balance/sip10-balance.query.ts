import { toFetchState } from '@/components/loading/fetch-state';
import { useAccountAddresses, useTotalAccountAddresses } from '@/hooks/use-account-addresses';
import { useSettings } from '@/store/settings/settings';
import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { AccountRequest, Sip10Balance, getSip10BalancesService } from '@leather.io/services';
import { getAssetId } from '@leather.io/utils';

import { balanceQueryOptions } from './balance-query-options';

export function useSip10TotalBalance() {
  const accounts = useTotalAccountAddresses();
  return toFetchState(useSip10AggregateBalanceQuery(accounts.map(account => ({ account }))));
}

export function useSip10AccountBalance(
  fingerprint: string,
  accountIndex: number,
  options?: {
    returnAllAssets?: boolean;
  }
) {
  const { assetVisibility } = useSettings();
  const account = useAccountAddresses(fingerprint, accountIndex);
  const queryResult = useSip10AccountBalanceQuery({
    account,
    filters: options?.returnAllAssets ? undefined : { assetVisibility },
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

/**
 * @deprecated useSip10TotalBalanceByAssetId is not used now we have moved to single account view
 * @see useSip10AccountBalanceByAssetId
 */
export function useSip10TotalBalanceByAssetId(assetId: string) {
  const accounts = useTotalAccountAddresses();
  return toFetchState(
    useSip10AggregateBalanceByAssetIdQuery(
      accounts.map(account => ({ account })),
      assetId
    )
  );
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
  const { fiatCurrencyPreference } = useSettings();
  return useQuery({
    queryKey: [
      'sip10-balances-service-get-sip10-aggregate-balance',
      requests,
      fiatCurrencyPreference,
    ],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getSip10BalancesService().getSip10AggregateBalance(requests, signal),
    ...balanceQueryOptions,
  });
}

export function useSip10AccountBalanceQuery(request: AccountRequest) {
  const { fiatCurrencyPreference } = useSettings();
  return useQuery({
    queryKey: ['sip10-balances-service-get-sip10-account-balance', request, fiatCurrencyPreference],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getSip10BalancesService().getSip10AccountBalance(request, signal),
    ...balanceQueryOptions,
  });
}

/**
 * @deprecated useSip10AggregateBalanceByAssetIdQuery is not used now we have moved to single account view
 * @see useSip10AccountBalanceByAssetIdQuery
 */
function useSip10AggregateBalanceByAssetIdQuery(requests: AccountRequest[], assetId: string) {
  const { fiatCurrencyPreference } = useSettings();
  return useQuery({
    queryKey: [
      'sip10-balances-service-get-sip10-aggregate-balance-by-asset-id',
      assetId,
      requests,
      fiatCurrencyPreference,
    ],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getSip10BalancesService().getSip10AggregateBalanceByAssetId(requests, assetId, signal),
    ...balanceQueryOptions,
  });
}

function useSip10BalanceByAssetIdQuery(request: AccountRequest, assetId: string) {
  const { fiatCurrencyPreference } = useSettings();
  return useQuery({
    queryKey: [
      'sip10-balances-service-get-sip10-balance-by-asset-id',
      assetId,
      request,
      fiatCurrencyPreference,
    ],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getSip10BalancesService().getSip10BalanceByAssetId(request, assetId, signal),
    ...balanceQueryOptions,
  });
}

function useSip10BalanceByContractIdQuery(request: AccountRequest, contractId: string) {
  const { fiatCurrencyPreference } = useSettings();
  return useQuery({
    queryKey: [
      'sip10-balances-service-get-sip10-balance-by-contract-id',
      contractId,
      request,
      fiatCurrencyPreference,
    ],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getSip10BalancesService().getSip10BalanceByContractId(request, contractId, signal),
    ...balanceQueryOptions,
  });
}
