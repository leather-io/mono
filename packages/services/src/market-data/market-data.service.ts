import BigNumber from 'bignumber.js';
import { inject, injectable } from 'inversify';

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
import type { SettingsService } from '../infrastructure/settings/settings.service';
import { Types } from '../inversify.types';
import { calculateBtcUsdEchangeRate } from './exchange-rate.utils';

@injectable()
export class MarketDataService {
  constructor(
    @inject(Types.SettingsService) private readonly settingsService: SettingsService,
    private readonly leatherApiClient: LeatherApiClient,
    private readonly bestInSlotApiClient: BestInSlotApiClient
  ) {}

  /**
   * Retrieves current market data for asset.
   */
  public async getMarketData(
    asset: FungibleCryptoAssetInfo,
    signal?: AbortSignal
  ): Promise<MarketData> {
    switch (asset.protocol) {
      case 'nativeBtc':
      case 'nativeStx':
        return await this.getNativeAssetMarketData(asset, signal);
      case 'sip10':
        return this.getSip10MarketData(asset, signal);
      case 'rune':
        return this.getRuneMarketData(asset, signal);
      case 'brc20':
        return this.getBrc20MarketData(asset, signal);
      default:
        throw Error('Market data not supported for asset type: ' + asset.protocol);
    }
  }

  /**
   * Get current market data for Native Asset (BTC, STX).
   */
  public async getNativeAssetMarketData(
    currency: NativeCryptoAssetInfo,
    signal?: AbortSignal
  ): Promise<MarketData> {
    const priceMap = await this.leatherApiClient.fetchNativeTokenPriceMap(signal);
    return await this.buildQuoteCurrencyPreferenceMarketData(
      currency.symbol,
      initBigNumber(priceMap[currency.symbol].price)
    );
  }

  /**
   * Get current market data for SIP10 Asset.
   */
  public async getSip10MarketData(
    asset: Sip10CryptoAssetInfo,
    signal?: AbortSignal
  ): Promise<MarketData> {
    const tokenPriceMap = await this.leatherApiClient.fetchSip10PriceMap(signal);
    const tokenPriceMatch = tokenPriceMap[asset.contractId];
    if (!tokenPriceMatch) {
      return createMarketData(
        createMarketPair(asset.symbol, this.settingsService.getSettings().quoteCurrency),
        createMoney(0, this.settingsService.getSettings().quoteCurrency)
      );
    }

    return await this.buildQuoteCurrencyPreferenceMarketData(
      asset.symbol,
      initBigNumber(tokenPriceMatch.price)
    );
  }

  /**
   * Get current market data for Rune Asset.
   */
  public async getRuneMarketData(
    asset: RuneCryptoAssetInfo,
    signal?: AbortSignal
  ): Promise<MarketData> {
    const runePriceMap = await this.leatherApiClient.fetchRunePriceMap(signal);

    const runePrice = runePriceMap[asset.runeName]
      ? runePriceMap[asset.runeName]
      : await this.leatherApiClient.fetchRunePrice(asset.runeName, signal);

    return await this.buildQuoteCurrencyPreferenceMarketData(
      asset.runeName,
      initBigNumber(runePrice.price)
    );
  }

  /**
   * Get current market data for BRC20 Asset.
   */
  public async getBrc20MarketData(
    asset: Brc20CryptoAssetInfo,
    signal?: AbortSignal
  ): Promise<MarketData> {
    const btcMarketData = await this.getNativeAssetMarketData(btcCryptoAsset, signal);
    const bisMarketInfo = await this.bestInSlotApiClient.fetchBrc20MarketInfo(asset.symbol, signal);
    const brc20FiatPrice = baseCurrencyAmountInQuote(
      createMoney(initBigNumber(bisMarketInfo.min_listed_unit_price ?? 0), 'BTC'),
      btcMarketData
    );

    return await this.buildQuoteCurrencyPreferenceMarketData(asset.symbol, brc20FiatPrice.amount);
  }

  private async buildQuoteCurrencyPreferenceMarketData(
    assetSymbol: string,
    assetPriceUsd: BigNumber
  ) {
    const assetPriceBase = convertAmountToFractionalUnit(
      assetPriceUsd,
      currencyDecimalsMap[this.settingsService.getSettings().quoteCurrency]
    );
    const quoteCurrencyMarketData = createMarketData(
      createMarketPair(assetSymbol, this.settingsService.getSettings().quoteCurrency),
      createMoney(
        this.settingsService.getSettings().quoteCurrency === 'USD'
          ? assetPriceBase
          : assetPriceBase.times(await this.readQuoteCurrencyPreferenceExchangeRate()),
        this.settingsService.getSettings().quoteCurrency
      )
    );
    return quoteCurrencyMarketData;
  }

  private async readQuoteCurrencyPreferenceExchangeRate() {
    const quoteCurrencyPreference = this.settingsService.getSettings().quoteCurrency;
    if (quoteCurrencyPreference === 'BTC') {
      const btcPriceUsd = initBigNumber(
        (await this.leatherApiClient.fetchNativeTokenPriceMap())['BTC'].price
      );
      return calculateBtcUsdEchangeRate(btcPriceUsd);
    } else {
      const exchangeRates = await this.leatherApiClient.fetchFiatExchangeRates();
      return initBigNumber(
        exchangeRates.rates[quoteCurrencyPreference as keyof typeof exchangeRates.rates]
      );
    }
  }
}
