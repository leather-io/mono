import { useQuery } from '@tanstack/react-query';

import type { AccountId } from '@leather.io/models';
import {
  createAccountAvailableBalanceQueryConfig,
  createAccountTotalBalanceQueryConfig,
} from '@leather.io/queries';
import type { AccountRequest } from '@leather.io/services';

import { useFlags } from '@app/features/feature-flags';
import { useUserSettings } from '@app/hooks/use-user-settings';
import { useAccountAddresses } from '@app/services/accounts/use-account-addresses';
import { toFetchState } from '@app/services/fetch-state';
import { useCurrentAccountId } from '@app/store/accounts/account';
import { useDiscardedInscriptions } from '@app/store/settings/settings.selectors';

import { balanceQueryOptions } from '../balance-query-options';

export function useCurrentAccountAvailableBalance() {
  const currentAccount = useCurrentAccountId();
  return useAccountAvailableBalance(currentAccount);
}

function useAccountAvailableBalance(accountId: AccountId) {
  const account = useAccountAddresses(accountId);
  const discardedInscriptions = useDiscardedInscriptions();
  const { isOrdinalsActive } = useFlags();
  return toFetchState(
    useGetAccountAvailableBalanceQuery({
      account,
      protections: {
        discardedInscriptions,
        isOrdinalsActive,
      },
    })
  );
}

export function useCurrentAccountTotalBalance() {
  const currentAccount = useCurrentAccountId();
  return useAccountTotalBalance(currentAccount);
}

export function useAccountTotalBalance(accountId: AccountId) {
  const account = useAccountAddresses(accountId);
  const discardedInscriptions = useDiscardedInscriptions();
  const { isOrdinalsActive } = useFlags();
  return toFetchState(
    useGetAccountTotalBalanceQuery({
      account,
      protections: {
        discardedInscriptions,
        isOrdinalsActive,
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
