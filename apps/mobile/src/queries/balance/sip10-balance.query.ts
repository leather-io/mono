import { toFetchState } from '@/components/loading/fetch-state';
import { useAccountAddresses, useTotalAccountAddresses } from '@/hooks/use-account-addresses';
import { useSettings } from '@/store/settings/settings';
import { AccountRequest, Sip10Balance } from '@leather.io/services';

import {
  useGetSip10AccountBalanceQuery as useSharedGetSip10AccountBalanceQuery,
  useGetSip10AggregateBalanceQuery as useSharedGetSip10AggregateBalanceQuery,
  useGetSip10AggregateBalanceByAssetIdQuery as useSharedGetSip10AggregateBalanceByAssetIdQuery,
  useGetSip10BalanceByAssetIdQuery as useSharedGetSip10BalanceByAssetIdQuery,
  useGetSip10BalanceByContractIdQuery as useSharedGetSip10BalanceByContractIdQuery,
} from '@leather.io/features';
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
  return useSharedGetSip10AggregateBalanceQuery(requests, {
    queryKeyContext: [fiatCurrencyPreference],
    ...balanceQueryOptions,
  });
}

export function useSip10AccountBalanceQuery(request: AccountRequest) {
  const { fiatCurrencyPreference, assetVisibility } = useSettings();
  const queryKeyContext = request.assets?.includeHiddenAssets
    ? [fiatCurrencyPreference]
    : [fiatCurrencyPreference, assetVisibility];
  return useSharedGetSip10AccountBalanceQuery(request, {
    queryKeyContext,
    ...balanceQueryOptions,
  });
}

/**
 * @deprecated useSip10AggregateBalanceByAssetIdQuery is not used now we have moved to single account view
 * @see useSip10AccountBalanceByAssetIdQuery
 */
function useSip10AggregateBalanceByAssetIdQuery(requests: AccountRequest[], assetId: string) {
  const { fiatCurrencyPreference } = useSettings();
  return useSharedGetSip10AggregateBalanceByAssetIdQuery(requests, assetId, {
    queryKeyContext: [fiatCurrencyPreference],
    ...balanceQueryOptions,
  });
}

function useSip10BalanceByAssetIdQuery(request: AccountRequest, assetId: string) {
  const { fiatCurrencyPreference } = useSettings();
  return useSharedGetSip10BalanceByAssetIdQuery(request, assetId, {
    queryKeyContext: [fiatCurrencyPreference],
    ...balanceQueryOptions,
  });
}

function useSip10BalanceByContractIdQuery(request: AccountRequest, contractId: string) {
  const { fiatCurrencyPreference } = useSettings();
  return useSharedGetSip10BalanceByContractIdQuery(request, contractId, {
    queryKeyContext: [fiatCurrencyPreference],
    ...balanceQueryOptions,
  });
}
