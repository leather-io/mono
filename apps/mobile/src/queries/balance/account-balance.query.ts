import { toFetchState } from '@/components/loading/fetch-state';
import { useAccountAddresses } from '@/hooks/use-account-addresses';
import { useSettings } from '@/store/settings/settings';
import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { AccountId, QuoteCurrency } from '@leather.io/models';
import { AccountRequest, getAccountBalancesService } from '@leather.io/services';

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
  return useQuery({
    queryKey: [
      'account-balances-service-get-total-balance',
      request,
      currencyPreference,
      assetVisibility,
    ],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getAccountBalancesService().getTotalBalance(request, signal),
    ...balanceQueryOptions,
  });
}

export function useGetAccountUnlockedBalanceQuery(
  request: AccountRequest,
  overrideFiatCurrencyPreference?: QuoteCurrency
) {
  const { fiatCurrencyPreference, assetVisibility } = useSettings();
  const currencyPreference = overrideFiatCurrencyPreference ?? fiatCurrencyPreference;
  return useQuery({
    queryKey: [
      'account-balances-service-get-unlocked-balance',
      request,
      currencyPreference,
      assetVisibility,
    ],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getAccountBalancesService().getUnlockedBalance(request, signal),
    ...balanceQueryOptions,
  });
}
