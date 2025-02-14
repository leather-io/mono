import BigNumber from 'bignumber.js';

import { btcCryptoAsset, currencyDecimalsMap } from '@leather.io/constants';
import {
  Brc20CryptoAssetInfo,
  FungibleCryptoAssetInfo,
  MarketData,
  NativeCryptoAssetInfo,
  RuneCryptoAssetInfo,
  Sip10CryptoAssetInfo,
  createMarketData,
  createMarketPair,
} from '@leather.io/models';
import {
  baseCurrencyAmountInQuote,
  convertAmountToFractionalUnit,
  createMoney,
  initBigNumber,
} from '@leather.io/utils';

import { BestInSlotApiClient } from '../infrastructure/api/best-in-slot/best-in-slot-api.client';
import { LeatherApiClient } from '../infrastructure/api/leather/leather-api.client';
import { SettingsService } from '../infrastructure/settings/settings.service';

export interface MarketDataService {
  getMarketData(asset: FungibleCryptoAssetInfo, signal?: AbortSignal): Promise<MarketData>;
  getNativeAssetMarketData(asset: NativeCryptoAssetInfo, signal?: AbortSignal): Promise<MarketData>;
  getSip10MarketData(asset: Sip10CryptoAssetInfo): Promise<MarketData>;
  getBrc20MarketData(asset: Brc20CryptoAssetInfo, signal?: AbortSignal): Promise<MarketData>;
  getRuneMarketData(asset: RuneCryptoAssetInfo, signal?: AbortSignal): Promise<MarketData>;
}

export function createMarketDataService(
  settingsService: SettingsService,
  leatherApiClient: LeatherApiClient,
  bestInSlotApiClient: BestInSlotApiClient
): MarketDataService {
  /**
   * Retrieves current market data for asset.
   */
  async function getMarketData(asset: FungibleCryptoAssetInfo, signal?: AbortSignal) {
    switch (asset.protocol) {
      case 'nativeBtc':
      case 'nativeStx':
        return await getNativeAssetMarketData(asset, signal);
      case 'sip10':
        return getSip10MarketData(asset, signal);
      case 'rune':
        return getRuneMarketData(asset, signal);
      case 'brc20':
        return getBrc20MarketData(asset, signal);
      default:
        throw Error('Market data not supported for asset type: ' + asset.protocol);
    }
  }

  /**
   * Get current market data for Native Asset (BTC, STX).
   */
  async function getNativeAssetMarketData(currency: NativeCryptoAssetInfo, signal?: AbortSignal) {
    const prices = await leatherApiClient.fetchCryptoPrices(signal);
    return await buildFiatCurrencyPreferenceMarketData(
      currency.symbol,
      convertAmountToFractionalUnit(
        initBigNumber(prices.prices[currency.symbol]),
        currencyDecimalsMap.USD
      )
    );
  }

  /**
   * Get current market data for SIP10 Asset.
   */
  async function getSip10MarketData(asset: Sip10CryptoAssetInfo, signal?: AbortSignal) {
    const tokenPrices = await leatherApiClient.fetchSip10Prices(signal);
    const tokenPriceMatch = tokenPrices.prices.find(price => price.principal === asset.contractId);
    if (!tokenPriceMatch)
      return createMarketData(
        createMarketPair(asset.symbol, settingsService.getSettings().fiatCurrency),
        createMoney(0, settingsService.getSettings().fiatCurrency)
      );

    const assetPrice = convertAmountToFractionalUnit(
      initBigNumber(tokenPriceMatch.price),
      currencyDecimalsMap.USD
    );

    return await buildFiatCurrencyPreferenceMarketData(asset.symbol, assetPrice);
  }

  /**
   * Get current market data for Rune Asset.
   */
  async function getRuneMarketData(asset: RuneCryptoAssetInfo, signal?: AbortSignal) {
    const btcMarketData = await getNativeAssetMarketData(btcCryptoAsset, signal);
    const runeTickerInfo = await bestInSlotApiClient.fetchRuneTickerInfo(asset.runeName, signal);
    const runeFiatPrice = baseCurrencyAmountInQuote(
      createMoney(initBigNumber(runeTickerInfo.avg_unit_price_in_sats ?? 0), 'BTC'),
      btcMarketData
    );

    return await buildFiatCurrencyPreferenceMarketData(
      runeTickerInfo.rune_name,
      runeFiatPrice.amount
    );
  }

  /**
   * Get current market data for BRC20 Asset.
   */
  async function getBrc20MarketData(asset: Brc20CryptoAssetInfo, signal?: AbortSignal) {
    const btcMarketData = await getNativeAssetMarketData(btcCryptoAsset, signal);
    const bisMarketInfo = await bestInSlotApiClient.fetchBrc20MarketInfo(asset.symbol, signal);
    const brc20FiatPrice = baseCurrencyAmountInQuote(
      createMoney(initBigNumber(bisMarketInfo.min_listed_unit_price ?? 0), 'BTC'),
      btcMarketData
    );

    return await buildFiatCurrencyPreferenceMarketData(asset.symbol, brc20FiatPrice.amount);
  }

  async function buildFiatCurrencyPreferenceMarketData(
    assetSymbol: string,
    assetPriceUsd: BigNumber
  ) {
    return createMarketData(
      createMarketPair(assetSymbol, settingsService.getSettings().fiatCurrency),
      createMoney(
        settingsService.getSettings().fiatCurrency === 'USD'
          ? assetPriceUsd
          : assetPriceUsd.times(await readFiatCurrencyPreferenceExchangeRate()),
        settingsService.getSettings().fiatCurrency
      )
    );
  }

  async function readFiatCurrencyPreferenceExchangeRate() {
    const exchangeRates = await leatherApiClient.fetchFiatExchangeRates();
    return initBigNumber(
      exchangeRates.rates[
        settingsService.getSettings().fiatCurrency as keyof typeof exchangeRates.rates
      ]
    );
  }

  return {
    getMarketData,
    getNativeAssetMarketData,
    getSip10MarketData,
    getRuneMarketData,
    getBrc20MarketData,
  };
}
