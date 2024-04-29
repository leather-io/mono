import { BTC_DECIMALS } from '@leather-wallet/constants';
import type { Money } from '@leather-wallet/models';
import { isEmptyArray } from '@leather-wallet/utils';

import { UtxoResponseItem } from '../../../types/utxo';

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
