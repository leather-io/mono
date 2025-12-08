import { toFetchState } from '@/components/loading/fetch-state';
import { useAccountAddresses, useTotalAccountAddresses } from '@/hooks/use-account-addresses';
import { useSettings } from '@/store/settings/settings';
import { useQuery } from '@tanstack/react-query';

import { AccountRequest, RuneBalance } from '@leather.io/services';
import { QuoteCurrency } from '@leather.io/models';
import {
  createRuneBalanceByRuneNameQueryConfig,
  createRunesAccountBalanceQueryConfig,
  createRunesAggregateBalanceQueryConfig,
} from '@leather.io/queries';
import type { UserSettings } from '@leather.io/services';
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
  const { fiatCurrencyPreference, networkPreference, assetVisibility } = useSettings();
  const settings: UserSettings = {
    network: networkPreference,
    quoteCurrency: fiatCurrencyPreference as QuoteCurrency,
    assetVisibility,
  };

  return useQuery({
    ...createRunesAggregateBalanceQueryConfig(requests, settings),
    ...balanceQueryOptions,
  });
}

function useRunesAccountBalanceQuery(request: AccountRequest) {
  const { fiatCurrencyPreference, networkPreference, assetVisibility } = useSettings();
  const settings: UserSettings = {
    network: networkPreference,
    quoteCurrency: fiatCurrencyPreference as QuoteCurrency,
    assetVisibility,
  };

  return useQuery({
    ...createRunesAccountBalanceQueryConfig(request, settings),
    ...balanceQueryOptions,
  });
}

function useRuneBalanceByRuneNameQuery(request: AccountRequest, runeName: string) {
  const { fiatCurrencyPreference, networkPreference, assetVisibility } = useSettings();
  const settings: UserSettings = {
    network: networkPreference,
    quoteCurrency: fiatCurrencyPreference as QuoteCurrency,
    assetVisibility,
  };

  return useQuery({
    ...createRuneBalanceByRuneNameQueryConfig(request, runeName, settings),
    ...balanceQueryOptions,
  });
}
