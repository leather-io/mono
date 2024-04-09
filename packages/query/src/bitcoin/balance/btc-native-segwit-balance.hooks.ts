import { useMemo } from 'react';

import { createBitcoinCryptoCurrencyAssetTypeWrapper } from '../address/address.utils';
import { useGetBitcoinBalanceByAddress } from './btc-balance.hooks';

// Balance is derived from a single query in address reuse mode
export function useNativeSegwitBalance(address: string) {
  const balance = useGetBitcoinBalanceByAddress(address);
  return useMemo(() => createBitcoinCryptoCurrencyAssetTypeWrapper(balance), [balance]);
}
