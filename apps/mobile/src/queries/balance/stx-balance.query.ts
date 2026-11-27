import { useAccountAddresses, useTotalAccountAddresses } from '@/hooks/use-account-addresses';
import { toFetchState } from '@/queries/fetch-state';
import { useSettings } from '@/store/settings/settings';
import { useQuery } from '@tanstack/react-query';

import {
  createStxAccountBalanceQueryConfig,
  createStxAggregateBalanceQueryConfig,
} from '@leather.io/queries';
import { type AccountRequest, type UserSettings } from '@leather.io/services';

import { balanceQueryOptions } from './balance-query-options';

export function useStxTotalBalance() {
  const accounts = useTotalAccountAddresses();
  return toFetchState(useStxAggregateBalanceQuery(accounts.map(account => ({ account }))));
}

export function useStxAccountBalance(fingerprint: string, accountIndex: number) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(useStxAccountBalanceQuery({ account }));
}

function useStxAggregateBalanceQuery(requests: AccountRequest[]) {
  const { fiatCurrencyPreference, networkPreference, assetVisibility } = useSettings();
  const settings: UserSettings = {
    network: networkPreference,
    quoteCurrency: fiatCurrencyPreference,
    assetVisibility,
  };

  return useQuery({
    ...createStxAggregateBalanceQueryConfig(requests, settings),
    ...balanceQueryOptions,
  });
}

function useStxAccountBalanceQuery(request: AccountRequest) {
  const { fiatCurrencyPreference, networkPreference, assetVisibility } = useSettings();
  const settings: UserSettings = {
    network: networkPreference,
    quoteCurrency: fiatCurrencyPreference,
    assetVisibility,
  };

  return useQuery({
    ...createStxAccountBalanceQueryConfig(request, settings),
    ...balanceQueryOptions,
  });
}
