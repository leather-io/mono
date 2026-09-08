import { useQuery } from '@tanstack/react-query';

import type { AccountAddresses, AccountId, Money } from '@leather.io/models';
import {
  createAccountLockedBalanceQueryConfig,
  createAccountTotalBalanceQueryConfig,
  createAccountUnlockedBalanceQueryConfig,
} from '@leather.io/queries';
import type { AccountRequest } from '@leather.io/services';

import { addMoney, useMockLockedBtc } from '@app/features/bonds/use-mock-locked-btc';
import { useUserSettings } from '@app/hooks/use-user-settings';
import {
  useAccountAddresses,
  useCurrentAccountAddresses,
} from '@app/services/accounts/use-account-addresses';
import { toFetchState } from '@app/services/fetch-state';

import { balanceQueryOptions } from '../balance-query-options';

export function useCurrentAccountUnlockedBalance() {
  const account = useCurrentAccountAddresses();
  return toFetchState(useGetAccountUnlockedBalanceQuery({ account }));
}

export function useCurrentAccountLockedBalance() {
  const account = useCurrentAccountAddresses();
  return toFetchState(useGetAccountLockedBalanceQuery({ account }));
}

export function useCurrentAccountTotalBalance() {
  const account = useCurrentAccountAddresses();
  return toFetchState(useGetAccountTotalBalanceQuery({ account }));
}

export function useAccountTotalBalance(accountId: AccountId) {
  const account = useAccountAddresses(accountId);
  return toFetchState(useGetAccountTotalBalanceQuery({ account }));
}

export function useAccountTotalBalanceQuery(accountId: AccountId) {
  const account = useAccountAddresses(accountId);
  return useGetAccountTotalBalanceQuery({ account });
}

export function useAccountTotalBalanceByAddressesQuery(account: AccountAddresses) {
  return useGetAccountTotalBalanceQuery({ account });
}

function useGetAccountUnlockedBalanceQuery(request: AccountRequest) {
  const settings = useUserSettings();
  return useQuery({
    ...createAccountUnlockedBalanceQueryConfig(request, settings),
    ...balanceQueryOptions,
  });
}

// Bond scenarios (non-production only) add their bonded BTC to locked and
// total, matching what the balance service reports once the index knows the bond
function useGetAccountLockedBalanceQuery(request: AccountRequest) {
  const settings = useUserSettings();
  const mockLocked = useMockLockedBtc();
  return useQuery({
    ...createAccountLockedBalanceQueryConfig(request, settings),
    ...balanceQueryOptions,
    select: mockLocked ? (locked: Money) => addMoney(locked, mockLocked.quote) : undefined,
  });
}

function useGetAccountTotalBalanceQuery(request: AccountRequest) {
  const settings = useUserSettings();
  const mockLocked = useMockLockedBtc();
  return useQuery({
    ...createAccountTotalBalanceQueryConfig(request, settings),
    ...balanceQueryOptions,
    select: mockLocked ? (total: Money) => addMoney(total, mockLocked.quote) : undefined,
  });
}
