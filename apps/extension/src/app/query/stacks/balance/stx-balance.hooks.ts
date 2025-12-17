import { createMoney } from '@leather.io/utils';

import { useAccountAddresses } from '@app/services/accounts/use-account-addresses';

import { useGetStxAccountBalanceQuery, useGetStxAddressBalanceQuery } from './stx-balance.query';

export function useStxAddressAvailableUnlockedBalance(address: string) {
  const stxBalance = useStxAddressBalance(address);
  return stxBalance.data?.stx.availableUnlockedBalance ?? createMoney(0, 'STX');
}

export function useStxAddressBalance(address: string) {
  return useGetStxAddressBalanceQuery(address);
}

export function useStxAccountBalance(accountIndex: number) {
  const account = useAccountAddresses(accountIndex);
  return useGetStxAccountBalanceQuery({ account });
}
