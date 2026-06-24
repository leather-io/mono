import { useQuery } from '@tanstack/react-query';

import type { AccountId } from '@leather.io/models';
import {
  createAccountAvailableBalanceQueryConfig,
  createAccountTotalBalanceQueryConfig,
} from '@leather.io/queries';
import type { AccountRequest } from '@leather.io/services';

import { useUserSettings } from '@app/hooks/use-user-settings';
import { useAccountAddresses } from '@app/services/accounts/use-account-addresses';
import { toFetchState } from '@app/services/fetch-state';
import { useCurrentAccountId } from '@app/store/accounts/account';

import { balanceQueryOptions } from '../balance-query-options';

export function useCurrentAccountAvailableBalance() {
  const currentAccount = useCurrentAccountId();
  return useAccountAvailableBalance(currentAccount);
}

function useAccountAvailableBalance(accountId: AccountId) {
  const account = useAccountAddresses(accountId);
  return toFetchState(useGetAccountAvailableBalanceQuery({ account }));
}

export function useCurrentAccountTotalBalance() {
  const currentAccount = useCurrentAccountId();
  return useAccountTotalBalance(currentAccount);
}

export function useAccountTotalBalance(accountId: AccountId) {
  const account = useAccountAddresses(accountId);
  return toFetchState(useGetAccountTotalBalanceQuery({ account }));
}

export function useAccountTotalBalanceQuery(accountId: AccountId) {
  const account = useAccountAddresses(accountId);
  return useGetAccountTotalBalanceQuery({ account });
}

function useGetAccountAvailableBalanceQuery(request: AccountRequest) {
  const settings = useUserSettings();
  return useQuery({
    ...createAccountAvailableBalanceQueryConfig(request, settings),
    ...balanceQueryOptions,
  });
}

function useGetAccountTotalBalanceQuery(request: AccountRequest) {
  const settings = useUserSettings();
  return useQuery({
    ...createAccountTotalBalanceQueryConfig(request, settings),
    ...balanceQueryOptions,
  });
}
