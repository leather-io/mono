import { AccountId } from '@/models/domain.model';
import { useBitcoinAccounts } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { useSettings } from '@/store/settings/settings';
import { QueryFunctionContext, useQueries, useQuery } from '@tanstack/react-query';

import { inferPaymentTypeFromPath } from '@leather.io/bitcoin';
import { Utxo, createUtxoQueryOptions } from '@leather.io/query';
import { getBitcoinBalancesService } from '@leather.io/services';
import { createMoney, isDefined } from '@leather.io/utils';

function getDescriptorFromKeychain<T extends { keyOrigin: string; xpub: string }>(
  accountKeychain: T
) {
  switch (inferPaymentTypeFromPath(accountKeychain.keyOrigin)) {
    case 'p2tr':
      return `tr(${accountKeychain.xpub})`;
    case 'p2wpkh':
      return `wpkh(${accountKeychain.xpub})`;
    default:
      return undefined;
  }
}

function useBitcoinDescriptors() {
  const keychains = useBitcoinAccounts();
  return keychains.list.map(getDescriptorFromKeychain).filter(isDefined);
}

function useBitcoinDescriptorsByAcccount(fingerprint: string, accountIndex: number) {
  const keychains = useBitcoinAccounts().fromAccountIndex(fingerprint, accountIndex);
  return keychains.map(getDescriptorFromKeychain).filter(isDefined);
}

function useCreateBitcoinAccountUtxoQueryOptions(descriptors: string[]) {
  const { networkPreference } = useSettings();
  return descriptors.map(key =>
    createUtxoQueryOptions(networkPreference.chain.bitcoin.bitcoinNetwork, key)
  );
}

export function useBitcoinAccountUtxos({ fingerprint, accountIndex }: AccountId) {
  const descriptors = useBitcoinDescriptorsByAcccount(fingerprint, accountIndex);
  const queries = useCreateBitcoinAccountUtxoQueryOptions(descriptors);
  return useQueries({
    queries,
    combine: results => {
      return {
        data: results.flatMap(result => result.data).filter(isDefined) as Utxo[],
        isLoading: results.some(result => result.isLoading),
        isPending: results.some(result => result.isPending),
        isError: results.some(result => result.isError),
      };
    },
  });
}

export function useTotalBitcoinBalanceOfDescriptors(descriptors: string[]) {
  const { isLoading, data } = useBtcBalanceQuery(descriptors);
  return {
    availableBalance: !isLoading && data ? data.balanceBtc.availableBalance : createMoney(0, 'BTC'),
    fiatBalance: !isLoading && data ? data.balanceUsd.availableBalance : createMoney(0, 'USD'),
  };
}

export function useWalletTotalBitcoinBalance() {
  const descriptors = useBitcoinDescriptors();
  return useTotalBitcoinBalanceOfDescriptors(descriptors);
}

export function useBitcoinAccountTotalBitcoinBalance({ fingerprint, accountIndex }: AccountId) {
  const descriptors = useBitcoinDescriptorsByAcccount(fingerprint, accountIndex);
  return useTotalBitcoinBalanceOfDescriptors(descriptors);
}

export function useBtcBalanceQuery(descriptors: string[]) {
  return useQuery({
    queryKey: ['bitcoin-balance-service-get-btc-balance', descriptors],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getBitcoinBalancesService().getBtcBalance(descriptors, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 1 * 1000,
    gcTime: 1 * 1000,
  });
}
