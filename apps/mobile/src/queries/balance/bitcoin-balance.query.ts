import { useBitcoinAccounts } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { useQueries } from '@tanstack/react-query';

import { inferPaymentTypeFromPath } from '@leather.io/bitcoin';
import { createBlockbookBalanceQueryOptions, createBlockbookQueryOptions } from '@leather.io/query';
import { isDefined, sumNumbers } from '@leather.io/utils';

function useParsedAccountDescriptors() {
  const keychains = useBitcoinAccounts();
  return keychains.list
    .map(accountKeychain => {
      switch (inferPaymentTypeFromPath(accountKeychain.keyOrigin)) {
        case 'p2tr':
          return `tr(${accountKeychain.xpub})`;
        case 'p2wpkh':
          return `wpkh(${accountKeychain.xpub})`;
        default:
          return undefined;
      }
    })
    .filter(isDefined);
}

export function useBitcoinAccountUtxos() {
  const descriptors = useParsedAccountDescriptors();
  return useQueries({
    queries: descriptors.map(key => createBlockbookQueryOptions(key)),
    combine(results) {
      return sumNumbers(
        results
          .map(data => data.data)
          .filter(isDefined)
          .map(data => sumNumbers(data.map(utxo => Number(utxo.value))).toNumber())
      ).toNumber();
    },
  });
}

export function useBitcoinAccountBalances() {
  const descriptors = useParsedAccountDescriptors();
  return useQueries({
    queries: descriptors.map(key => createBlockbookBalanceQueryOptions(key)),
    combine(results) {
      return sumNumbers(
        results
          .map(data => data.data)
          .filter(data => !!data)
          .map(data => data.balance)
          .map(val => Number(val))
      ).toNumber();
    },
  });
}
