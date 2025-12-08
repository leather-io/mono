import { useQuery } from '@tanstack/react-query';

import type { AccountRequest } from '@leather.io/services';
import { createAccountTotalBalanceQueryConfig } from '@leather.io/queries';

import { useUserSettings } from '@app/hooks/use-user-settings';
import { toFetchState } from '@app/services/fetch-state';
import { useAccountAddresses } from '@app/services/use-account-addresses';
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
