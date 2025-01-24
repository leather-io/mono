import { BTC_DECIMALS } from '@leather.io/constants';
import type { Money, UtxoResponseItem } from '@leather.io/models';
import { isEmptyArray } from '@leather.io/utils';

export function createBitcoinCryptoCurrencyAssetTypeWrapper(balance: Money) {
  return {
    blockchain: 'bitcoin',
    balance,
    asset: {
      decimals: BTC_DECIMALS,
      hasMemo: true,
      name: 'Bitcoin',
      symbol: 'BTC',
    },
    type: 'crypto-currency',
  };
}

export function hasInscriptions(utxos: UtxoResponseItem[]) {
  return !isEmptyArray(utxos);
}
