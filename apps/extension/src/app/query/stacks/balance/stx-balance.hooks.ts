import { createMoney } from '@leather.io/utils';

import { useAccountAddresses } from '@app/services/accounts/use-account-addresses';
import { toFetchState } from '@app/services/fetch-state';

import { useGetStxAccountBalanceQuery, useGetStxAddressBalanceQuery } from './stx-balance.query';

export function useStxAddressAvailableUnlockedBalance(address: string) {
  const stxBalance = useStxAddressBalance(address);
  return stxBalance.value?.stx.availableUnlockedBalance ?? createMoney(0, 'STX');
}

export function useStxAddressBalance(address: string) {
  return toFetchState(useGetStxAddressBalanceQuery(address));
}

export function useStxAccountBalance(accountIndex: number) {
  const account = useAccountAddresses(accountIndex);
  return toFetchState(useGetStxAccountBalanceQuery({ account }));
}
