import { toFetchState } from '@/components/loading/fetch-state';
import { useAccountAddresses, useTotalAccountAddresses } from '@/hooks/use-account-addresses';
import { useSettings } from '@/store/settings/settings';
import { useQuery } from '@tanstack/react-query';

import { QuoteCurrency } from '@leather.io/models';
import {
  createStxAccountBalanceQueryConfig,
  createStxAggregateBalanceQueryConfig,
} from '@leather.io/queries';
import { AccountRequest, UserSettings } from '@leather.io/services';

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
    quoteCurrency: fiatCurrencyPreference as QuoteCurrency,
    assetVisibility,
  };

  return useQuery({
    ...createStxAggregateBalanceQueryConfig(requests, settings),
    ...balanceQueryOptions,
  });
}

export function useStxAccountBalanceQuery(request: AccountRequest) {
  const { fiatCurrencyPreference, networkPreference, assetVisibility } = useSettings();
  const settings: UserSettings = {
    network: networkPreference,
    quoteCurrency: fiatCurrencyPreference as QuoteCurrency,
    assetVisibility,
  };

  return useQuery({
    ...createStxAccountBalanceQueryConfig(request, settings),
    ...balanceQueryOptions,
  });
}
