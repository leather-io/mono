import { useCallback } from 'react';

import { AccountId } from '@/models/domain.model';
import { useBitcoinAccounts } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { useSettings } from '@/store/settings/settings';
import { UseQueryResult, useQueries } from '@tanstack/react-query';

import { inferPaymentTypeFromPath } from '@leather.io/bitcoin';
import { createUtxoQueryOptions, useCalculateBitcoinFiatValue } from '@leather.io/query';
import { createMoney, isDefined, sumNumbers } from '@leather.io/utils';

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

type TotalBalanceCombineFn = UseQueryResult<
  {
    value: string;
    path: string;
    address: string;
    txid: string;
    confirmations: number;
    vout: number;
    height?: number | undefined;
  }[],
  Error
>[];

export function useTotalBitcoinBalanceOfDescriptors(descriptors: string[]) {
  const queries = useCreateBitcoinAccountUtxoQueryOptions(descriptors);
  const calcUsdAmount = useCalculateBitcoinFiatValue();

  const combine = useCallback(
    (results: TotalBalanceCombineFn) => {
      const amount = sumNumbers(
        results
          .map(data => data.data)
          .filter(isDefined)
          .map(data => sumNumbers(data.map(utxo => Number(utxo.value))).toNumber())
      );

      const availableBalance = createMoney(amount, 'BTC');
      const fiatBalance = calcUsdAmount(availableBalance);

      return { availableBalance, fiatBalance };
    },
    [calcUsdAmount]
  );

  return useQueries({ queries, combine });
}

export function useWalletTotalBitcoinBalance() {
  const descriptors = useBitcoinDescriptors();
  return useTotalBitcoinBalanceOfDescriptors(descriptors);
}

export function useBitcoinAccountTotalBitcoinBalance({ fingerprint, accountIndex }: AccountId) {
  const descriptors = useBitcoinDescriptorsByAcccount(fingerprint, accountIndex);
  return useTotalBitcoinBalanceOfDescriptors(descriptors);
}
