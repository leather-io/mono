import { toFetchState } from '@/components/loading/fetch-state';
import { useAccountAddresses, useTotalAccountAddresses } from '@/hooks/use-account-addresses';
import { useQuery } from '@tanstack/react-query';

import { AccountRequest } from '@leather.io/services';
import {
  createStxAccountBalanceQueryConfig,
  createStxAggregateBalanceQueryConfig,
} from '@leather.io/queries';

import { balanceQueryOptions } from './balance-query-options';
import { useUserSettings } from './use-user-settings';

export function useStxTotalBalance() {
  const accounts = useTotalAccountAddresses();
  return toFetchState(useStxAggregateBalanceQuery(accounts.map(account => ({ account }))));
}

export function useStxAccountBalance(fingerprint: string, accountIndex: number) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(useStxAccountBalanceQuery({ account }));
}

function useStxAggregateBalanceQuery(requests: AccountRequest[]) {
  const settings = useUserSettings();
  return useQuery({
    ...createStxAggregateBalanceQueryConfig(requests, settings),
    ...balanceQueryOptions,
  });
}

export function useStxAccountBalanceQuery(request: AccountRequest) {
  const settings = useUserSettings();
  return useQuery({
    ...createStxAccountBalanceQueryConfig(request, settings),
    ...balanceQueryOptions,
  });
}
