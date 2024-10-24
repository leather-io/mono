import {
  CryptoCurrency,
  FiatCurrency,
  FungibleCryptoAsset,
  MarketData,
  createMarketData,
  createMarketPair,
} from '@leather.io/models';

import { createMoneyFromDecimal } from '../../../utils/dist';
import { CoinGeckoApiClient } from '../infrastructure/api/coingecko/coingecko-api.client';

export interface MarketDataService {
  getCryptoAssetMarketData(asset: FungibleCryptoAsset, fiat?: FiatCurrency): Promise<MarketData>;
  getNativeCurrencyMarketData(currency: CryptoCurrency, fiat?: FiatCurrency): Promise<MarketData>;
  getSip10MarketData(symbol: string, fiat?: FiatCurrency): Promise<MarketData>;
}

export function createMarketDataService(coinGeckoApiClient: CoinGeckoApiClient): MarketDataService {
  async function getCryptoAssetMarketData(asset: FungibleCryptoAsset, fiat: FiatCurrency = 'USD') {
    switch (asset.type) {
      case 'stacks-stx':
      case 'bitcoin-btc':
        return await getNativeCurrencyMarketData(
          asset.type === 'bitcoin-btc' ? 'BTC' : 'STX',
          fiat
        );
      default:
        throw Error('Currency market data not supported');
      // case 'brc-20':
      //   break;
      // case 'rune':
      //   break;
      // case 'sip-10':
      //   break;
    }
  }

  async function getNativeCurrencyMarketData(currency: CryptoCurrency, fiat: FiatCurrency = 'USD') {
    const amount = await coinGeckoApiClient.fetchMarketDataAmount(currency, fiat);
    return createMarketData(createMarketPair(currency, fiat), createMoneyFromDecimal(amount, fiat));
  }

  async function getSip10MarketData(symbol: string, fiat: FiatCurrency = 'USD') {
    return null;
  }

  return {
    getCryptoAssetMarketData,
    getNativeCurrencyMarketData,
    getSip10MarketData,
  };
}
