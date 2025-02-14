import { useMemo } from 'react';

import { BitcoinAddress } from '@leather.io/models';

import { createBitcoinCryptoCurrencyAssetTypeWrapper } from '../address/address.utils';
import { useGetBitcoinBalanceByAddress } from './btc-balance.hooks';

// Balance is derived from a single query in address reuse mode
export function useNativeSegwitBalance(address: BitcoinAddress) {
  const { balance, isLoading, isFetching } = useGetBitcoinBalanceByAddress(address);

  const wrappedBalance = useMemo(
    () => createBitcoinCryptoCurrencyAssetTypeWrapper(balance),
    [balance]
  );

  return {
    btcBalance: wrappedBalance,
    isLoading,
    isFetching,
  };
}
