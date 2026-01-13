import { toFetchState } from '@/components/loading/fetch-state';
import { useAccountAddresses } from '@/hooks/use-account-addresses';
import { useSettings } from '@/store/settings/settings';
import { useQuery } from '@tanstack/react-query';

import { AccountId, Money, QuoteCurrency } from '@leather.io/models';
import {
  createAccountAvailableBalanceQueryConfig,
  createAccountUnlockedBalanceQueryConfig,
} from '@leather.io/queries';
import { AccountRequest, UserSettings } from '@leather.io/services';

import { balanceQueryOptions } from './balance-query-options';

export function useAccountTotalBalance(
  accountId: AccountId,
  overrideFiatCurrencyPreference?: QuoteCurrency
) {
  const account = useAccountAddresses(accountId.fingerprint, accountId.accountIndex);
  const query = useGetAccountTotalBalanceQuery({ account }, overrideFiatCurrencyPreference);

  return toFetchState<Money>({
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ?? null,
  });
}

export function useAccountUnlockedBalance(
  accountId: AccountId,
  overrideFiatCurrencyPreference?: QuoteCurrency
) {
  const account = useAccountAddresses(accountId.fingerprint, accountId.accountIndex);
  const query = useGetAccountUnlockedBalanceQuery({ account }, overrideFiatCurrencyPreference);

  return toFetchState<Money>({
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ?? null,
  });
}

export function useGetAccountTotalBalanceQuery(
  request: AccountRequest,
  overrideFiatCurrencyPreference?: QuoteCurrency
) {
  const { fiatCurrencyPreference, networkPreference, assetVisibility } = useSettings();
  const currencyPreference = overrideFiatCurrencyPreference ?? fiatCurrencyPreference;
  const settings: UserSettings = {
    network: networkPreference,
    quoteCurrency: currencyPreference,
    assetVisibility,
  };

  return useQuery({
    ...createAccountAvailableBalanceQueryConfig(request, settings),
    ...balanceQueryOptions,
  });
}

export function useGetAccountUnlockedBalanceQuery(
  request: AccountRequest,
  overrideFiatCurrencyPreference?: QuoteCurrency
) {
  const { fiatCurrencyPreference, networkPreference, assetVisibility } = useSettings();
  const currencyPreference = overrideFiatCurrencyPreference ?? fiatCurrencyPreference;
  const settings: UserSettings = {
    network: networkPreference,
    quoteCurrency: currencyPreference,
    assetVisibility,
  };

  return useQuery({
    ...createAccountUnlockedBalanceQueryConfig(request, settings),
    ...balanceQueryOptions,
  });
}
