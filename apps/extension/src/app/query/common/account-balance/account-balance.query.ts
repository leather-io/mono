import { useQuery } from '@tanstack/react-query';

import {
  createAccountAvailableBalanceQueryConfig,
  createAccountTotalBalanceQueryConfig,
} from '@leather.io/queries';
import type { AccountRequest } from '@leather.io/services';

import { useUserSettings } from '@app/hooks/use-user-settings';
import { useAccountAddresses } from '@app/services/accounts/use-account-addresses';
import { toFetchState } from '@app/services/fetch-state';
import { useCurrentAccountIndex } from '@app/store/accounts/account';
import { useDiscardedInscriptions } from '@app/store/settings/settings.selectors';

import { balanceQueryOptions } from '../balance-query-options';

export function useCurrentAccountAvailableBalance() {
  const accountIndex = useCurrentAccountIndex();
  return useAccountAvailableBalance(accountIndex);
}

function useAccountAvailableBalance(accountIndex: number) {
  const account = useAccountAddresses(accountIndex);
  const discardedInscriptions = useDiscardedInscriptions();
  return toFetchState(
    useGetAccountAvailableBalanceQuery({
      account,
      protections: {
        discardedInscriptions,
      },
    })
  );
}

export function useCurrentAccountTotalBalance() {
  const accountIndex = useCurrentAccountIndex();
  return useAccountTotalBalance(accountIndex);
}

export function useAccountTotalBalance(accountIndex: number) {
  const account = useAccountAddresses(accountIndex);
  const discardedInscriptions = useDiscardedInscriptions();
  return toFetchState(
    useGetAccountTotalBalanceQuery({
      account,
      protections: {
        discardedInscriptions,
      },
    })
  );
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
