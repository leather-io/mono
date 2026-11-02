import { useCallback, useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import {
  type CryptoCurrency,
  type FungibleAssetId,
  type MarketData,
  type Money,
  createMarketData,
  createMarketPair,
} from '@leather.io/models';
import { createMarketDataByAssetIdQueryConfig } from '@leather.io/queries';
import { baseCurrencyAmountInQuote, createMoney } from '@leather.io/utils';

import { useUserSettings } from '@app/hooks/use-user-settings';

const cryptoCurrencyAssetIds: Record<CryptoCurrency, FungibleAssetId> = {
  BTC: { protocol: 'nativeBtc', id: 'BTC' },
  STX: { protocol: 'nativeStx', id: 'STX' },
};

export function useCryptoCurrencyMarketData(currency: CryptoCurrency): MarketData {
  const settings = useUserSettings();
  const { data } = useQuery(
    createMarketDataByAssetIdQueryConfig(cryptoCurrencyAssetIds[currency], settings)
  );

  return useMemo(
    () => data ?? createMarketData(createMarketPair(currency, 'USD'), createMoney(0, 'USD')),
    [currency, data]
  );
}

export function useCalculateBitcoinFiatValue() {
  const btcMarketData = useCryptoCurrencyMarketData('BTC');

  return useCallback(
    (value: Money) => baseCurrencyAmountInQuote(value, btcMarketData),
    [btcMarketData]
  );
}
