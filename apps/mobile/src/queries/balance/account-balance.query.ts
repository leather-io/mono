import { toFetchState } from '@/components/loading/fetch-state';
import { useAccountAddresses } from '@/hooks/use-account-addresses';
import { useSettings } from '@/store/settings/settings';
import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { AccountId } from '@leather.io/models';
import { AccountRequest, getAccountBalancesService } from '@leather.io/services';

import { balanceQueryOptions } from './balance-query-options';

export function useAccountTotalBalance(accountId: AccountId) {
  const account = useAccountAddresses(accountId.fingerprint, accountId.accountIndex);
  const { assetVisibility } = useSettings();
  return toFetchState(
    useGetAccountTotalBalanceQuery({
      account,
      filters: {
        assetVisibility,
      },
    })
  );
}

export function useAccountUnlockedBalance(accountId: AccountId) {
  const account = useAccountAddresses(accountId.fingerprint, accountId.accountIndex);
  const { assetVisibility } = useSettings();
  return toFetchState(useGetAccountUnlockedBalanceQuery({ account, filters: { assetVisibility } }));
}

export function useGetAccountTotalBalanceQuery(request: AccountRequest) {
  const { fiatCurrencyPreference } = useSettings();
  return useQuery({
    queryKey: ['account-balances-service-get-total-balance', request, fiatCurrencyPreference],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getAccountBalancesService().getTotalBalance(request, signal),
    ...balanceQueryOptions,
  });
}

export function useGetAccountUnlockedBalanceQuery(request: AccountRequest) {
  const { fiatCurrencyPreference } = useSettings();
  return useQuery({
    queryKey: ['account-balances-service-get-unlocked-balance', request, fiatCurrencyPreference],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getAccountBalancesService().getUnlockedBalance(request, signal),
    ...balanceQueryOptions,
  });
}
