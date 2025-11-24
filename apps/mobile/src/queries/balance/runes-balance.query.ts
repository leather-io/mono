import { toFetchState } from '@/components/loading/fetch-state';
import { useAccountAddresses, useTotalAccountAddresses } from '@/hooks/use-account-addresses';
import { useSettings } from '@/store/settings/settings';
import { AccountRequest, RuneBalance } from '@leather.io/services';

import {
  useGetRunesAccountBalanceQuery as useSharedGetRunesAccountBalanceQuery,
  useGetRunesAggregateBalanceQuery as useSharedGetRunesAggregateBalanceQuery,
  useGetRuneBalanceByRuneNameQuery as useSharedGetRuneBalanceByRuneNameQuery,
} from '@leather.io/features';
import { getAssetId } from '@leather.io/utils';

import { balanceQueryOptions } from './balance-query-options';

export function useRunesTotalBalance() {
  const accounts = useTotalAccountAddresses();
  return toFetchState(useRunesAggregateBalanceQuery(accounts.map(account => ({ account }))));
}

export function useRuneBalanceByRuneName(
  fingerprint: string,
  accountIndex: number,
  runeName: string
) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(useRuneBalanceByRuneNameQuery({ account }, runeName));
}

export function useRunesAccountBalance(
  fingerprint: string,
  accountIndex: number,
  options?: {
    includeHiddenAssets?: boolean;
  }
) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  const queryResult = useRunesAccountBalanceQuery({
    account,
    assets: { includeHiddenAssets: options?.includeHiddenAssets },
  });
  return toFetchState(queryResult);
}

export function useManagedRunesTools(fingerprint: string, accountIndex: number) {
  const enabledRunes = useRunesAccountBalance(fingerprint, accountIndex);
  return {
    isEnabled: (token: RuneBalance) =>
      !!enabledRunes.value?.runes.find(rune => {
        return getAssetId(rune.asset).id === getAssetId(token.asset).id;
      }),
  };
}

function useRunesAggregateBalanceQuery(requests: AccountRequest[]) {
  const { fiatCurrencyPreference } = useSettings();
  return useSharedGetRunesAggregateBalanceQuery(requests, {
    queryKeyContext: [fiatCurrencyPreference],
    ...balanceQueryOptions,
  });
}

function useRunesAccountBalanceQuery(request: AccountRequest) {
  const { fiatCurrencyPreference, assetVisibility } = useSettings();
  const queryKeyContext = request.assets?.includeHiddenAssets
    ? [fiatCurrencyPreference]
    : [fiatCurrencyPreference, assetVisibility];
  return useSharedGetRunesAccountBalanceQuery(request, {
    queryKeyContext,
    ...balanceQueryOptions,
  });
}

function useRuneBalanceByRuneNameQuery(request: AccountRequest, runeName: string) {
  const { fiatCurrencyPreference } = useSettings();
  return useSharedGetRuneBalanceByRuneNameQuery(request, runeName, {
    queryKeyContext: [fiatCurrencyPreference],
    ...balanceQueryOptions,
  });
}
