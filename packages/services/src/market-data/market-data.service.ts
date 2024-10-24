import {
  Brc20CryptoAssetInfo,
  CryptoCurrency,
  FungibleCryptoAssetInfo,
  MarketData,
  RuneCryptoAssetInfo,
  Sip10CryptoAssetInfo,
  createMarketData,
  createMarketPair,
} from '@leather.io/models';
import {
  baseCurrencyAmountInQuote,
  calculateMeanAverage,
  convertAmountToFractionalUnit,
  createMoney,
  getPrincipalFromContractId,
  initBigNumber,
  isDefined,
  isFulfilled,
} from '@leather.io/utils';

import { AlexSdkClient } from '../infrastructure/api/alex-sdk/alex-sdk.client';
import { BestInSlotApiClient } from '../infrastructure/api/best-in-slot/best-in-slot-api.client';
import { BinanceApiClient } from '../infrastructure/api/binance/binance-api.client';
import { CoincapApiClient } from '../infrastructure/api/coincap/coincap-api.client';
import { CoinGeckoApiClient } from '../infrastructure/api/coingecko/coingecko-api.client';

export interface MarketDataService {
  getMarketData(asset: FungibleCryptoAssetInfo, signal?: AbortSignal): Promise<MarketData>;
  getBtcMarketData(signal?: AbortSignal): Promise<MarketData>;
  getStxMarketData(signal?: AbortSignal): Promise<MarketData>;
  getSip10MarketData(asset: Sip10CryptoAssetInfo): Promise<MarketData>;
  getBrc20MarketData(asset: Brc20CryptoAssetInfo, signal?: AbortSignal): Promise<MarketData>;
  getRuneMarketData(asset: RuneCryptoAssetInfo, signal?: AbortSignal): Promise<MarketData>;
}

export function createMarketDataService(
  bestInSlotApiClient: BestInSlotApiClient,
  coinGeckoApiClient: CoinGeckoApiClient,
  coincapApiClient: CoincapApiClient,
  binanceApiClient: BinanceApiClient,
  alexSdkClient: AlexSdkClient
): MarketDataService {
  async function getMarketData(asset: FungibleCryptoAssetInfo, signal?: AbortSignal) {
    switch (asset.protocol) {
      case 'nativeBtc':
        return await getBtcMarketData(signal);
      case 'nativeStx':
        return await getStxMarketData(signal);
      case 'sip10':
        return getSip10MarketData(asset);
      case 'rune':
        return getRuneMarketData(asset, signal);
      case 'brc20':
        return getBrc20MarketData(asset, signal);
      default:
        throw Error('Market data not supported for asset type: ' + asset.protocol);
    }
  }

  async function getBtcMarketData(signal?: AbortSignal) {
    return await getNativeAssetMarketData('BTC', signal);
  }

  async function getStxMarketData(signal?: AbortSignal) {
    return await getNativeAssetMarketData('STX', signal);
  }

  async function getNativeAssetMarketData(currency: CryptoCurrency, signal?: AbortSignal) {
    const prices = (
      await Promise.allSettled([
        coinGeckoApiClient.fetchMarketDataPrice(currency, signal),
        coincapApiClient.fetchAssetPrice(currency, signal),
        binanceApiClient.fetchMarketDataPrice(currency, signal),
      ])
    )
      .filter(isFulfilled)
      .map(r => r.value)
      .filter(isDefined);
    if (prices.length === 0) throw new Error('Unable to fetch price data: ' + currency);
    return createMarketData(
      createMarketPair(currency, 'USD'),
      createMoney(calculateMeanAverage(prices.filter(isDefined)), 'USD')
    );
  }

  async function getSip10MarketData(asset: Sip10CryptoAssetInfo) {
    const alexSdkCurrencies = await alexSdkClient.getSwappableCurrencies();
    const alexSdkPrices = await alexSdkClient.getLatestPrices();
    const alexSdkAssetMatch = alexSdkCurrencies
      .filter(isDefined)
      .find(
        token =>
          getPrincipalFromContractId(token.underlyingToken) ===
          getPrincipalFromContractId(asset.contractId)
      );
    if (!alexSdkPrices || !alexSdkAssetMatch)
      return createMarketData(createMarketPair(asset.symbol, 'USD'), createMoney(0, 'USD'));
    const assetPrice = convertAmountToFractionalUnit(
      initBigNumber(alexSdkPrices[alexSdkAssetMatch.id] ?? 0),
      2
    );
    return createMarketData(createMarketPair(asset.symbol, 'USD'), createMoney(assetPrice, 'USD'));
  }

  async function getRuneMarketData(asset: RuneCryptoAssetInfo, signal?: AbortSignal) {
    const btcMarketData = await getNativeAssetMarketData('BTC', signal);
    const runeTickerInfo = await bestInSlotApiClient.fetchRuneTickerInfo(asset.symbol, signal);
    const runeFiatPrice = baseCurrencyAmountInQuote(
      createMoney(initBigNumber(runeTickerInfo.avg_unit_price_in_sats ?? 0), 'BTC'),
      btcMarketData
    );
    return createMarketData(
      createMarketPair(runeTickerInfo.rune_name, 'USD'),
      createMoney(runeFiatPrice.amount, 'USD')
    );
  }

  async function getBrc20MarketData(asset: Brc20CryptoAssetInfo, signal?: AbortSignal) {
    const btcMarketData = await getNativeAssetMarketData('BTC', signal);
    const bisMarketInfo = await bestInSlotApiClient.fetchBrc20MarketInfo(asset.symbol, signal);
    const brc20FiatPrice = baseCurrencyAmountInQuote(
      createMoney(initBigNumber(bisMarketInfo.min_listed_unit_price ?? 0), 'BTC'),
      btcMarketData
    );
    return createMarketData(
      createMarketPair(asset.symbol, 'USD'),
      createMoney(brc20FiatPrice.amount, 'USD')
    );
  }

  return {
    getMarketData,
    getBtcMarketData,
    getStxMarketData,
    getSip10MarketData,
    getRuneMarketData,
    getBrc20MarketData,
  };
}
