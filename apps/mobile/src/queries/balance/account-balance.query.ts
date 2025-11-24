import { toFetchState } from '@/components/loading/fetch-state';
import { useAccountAddresses } from '@/hooks/use-account-addresses';
import { useSettings } from '@/store/settings/settings';

import { AccountId, QuoteCurrency } from '@leather.io/models';
import { AccountRequest } from '@leather.io/services';

import {
  useGetAccountTotalBalanceQuery as useSharedGetAccountTotalBalanceQuery,
  useGetAccountUnlockedBalanceQuery as useSharedGetAccountUnlockedBalanceQuery,
} from '@leather.io/features';

import { balanceQueryOptions } from './balance-query-options';

export function useAccountTotalBalance(
  accountId: AccountId,
  overrideFiatCurrencyPreference?: QuoteCurrency
) {
  const account = useAccountAddresses(accountId.fingerprint, accountId.accountIndex);
  return toFetchState(useGetAccountTotalBalanceQuery({ account }, overrideFiatCurrencyPreference));
}

export function useAccountUnlockedBalance(
  accountId: AccountId,
  overrideFiatCurrencyPreference?: QuoteCurrency
) {
  const account = useAccountAddresses(accountId.fingerprint, accountId.accountIndex);
  return toFetchState(
    useGetAccountUnlockedBalanceQuery({ account }, overrideFiatCurrencyPreference)
  );
}

export function useGetAccountTotalBalanceQuery(
  request: AccountRequest,
  overrideFiatCurrencyPreference?: QuoteCurrency
) {
  const { fiatCurrencyPreference, assetVisibility } = useSettings();
  const currencyPreference = overrideFiatCurrencyPreference ?? fiatCurrencyPreference;
  return useSharedGetAccountTotalBalanceQuery(request, {
    queryKeyContext: [currencyPreference, assetVisibility],
    ...balanceQueryOptions,
  });
}

export function useGetAccountUnlockedBalanceQuery(
  request: AccountRequest,
  overrideFiatCurrencyPreference?: QuoteCurrency
) {
  const { fiatCurrencyPreference, assetVisibility } = useSettings();
  const currencyPreference = overrideFiatCurrencyPreference ?? fiatCurrencyPreference;
  return useSharedGetAccountUnlockedBalanceQuery(request, {
    queryKeyContext: [currencyPreference, assetVisibility],
    ...balanceQueryOptions,
  });
}
