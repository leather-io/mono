import { useQuery } from '@tanstack/react-query';

import { createAccountTotalBalanceQueryConfig } from '@leather.io/queries';
import type { AccountRequest } from '@leather.io/services';

import { useUserSettings } from '@app/hooks/use-user-settings';
import { useAccountAddresses } from '@app/services/accounts/use-account-addresses';
import { toFetchState } from '@app/services/fetch-state';
import { useCurrentAccountIndex } from '@app/store/accounts/account';

import { balanceQueryOptions } from '../balance-query-options';

export function useCurrentAccountTotalBalance() {
  const accountIndex = useCurrentAccountIndex();
  return useAccountTotalBalance(accountIndex);
}

export function useAccountTotalBalance(accountIndex: number) {
  const account = useAccountAddresses(accountIndex);
  return toFetchState(
    useGetAccountTotalBalanceQuery({
      account,
    })
  );
}

function useGetAccountTotalBalanceQuery(request: AccountRequest) {
  const settings = useUserSettings();
  return useQuery({
    ...createAccountTotalBalanceQueryConfig(request, settings),
    ...balanceQueryOptions,
  });
}
