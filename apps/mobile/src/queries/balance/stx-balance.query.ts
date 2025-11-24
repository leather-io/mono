import { toFetchState } from '@/components/loading/fetch-state';
import { useAccountAddresses, useTotalAccountAddresses } from '@/hooks/use-account-addresses';
import { useSettings } from '@/store/settings/settings';
import { AccountRequest } from '@leather.io/services';

import {
  useGetStxAccountBalanceQuery as useSharedGetStxAccountBalanceQuery,
  useGetStxAggregateBalanceQuery as useSharedGetStxAggregateBalanceQuery,
} from '@leather.io/features';

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
  const { fiatCurrencyPreference } = useSettings();
  return useSharedGetStxAggregateBalanceQuery(requests, {
    queryKeyContext: [fiatCurrencyPreference],
    ...balanceQueryOptions,
  });
}

export function useStxAccountBalanceQuery(request: AccountRequest) {
  const { fiatCurrencyPreference } = useSettings();
  return useSharedGetStxAccountBalanceQuery(request, {
    queryKeyContext: [fiatCurrencyPreference],
    ...balanceQueryOptions,
  });
}
