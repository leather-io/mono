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
    const prices = await this.leatherApiClient.fetchCryptoPrices(signal);
    return await this.buildFiatCurrencyPreferenceMarketData(
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
  public async getSip10MarketData(
    asset: Sip10CryptoAssetInfo,
    signal?: AbortSignal
  ): Promise<MarketData> {
    const tokenPrices = await this.leatherApiClient.fetchSip10Prices(signal);
    const tokenPriceMatch = tokenPrices.prices.find(price => price.principal === asset.contractId);
    if (!tokenPriceMatch)
      return createMarketData(
        createMarketPair(asset.symbol, this.settingsService.getSettings().fiatCurrency),
        createMoney(0, this.settingsService.getSettings().fiatCurrency)
      );

    const assetPrice = convertAmountToFractionalUnit(
      initBigNumber(tokenPriceMatch.price),
      currencyDecimalsMap.USD
    );

    return await this.buildFiatCurrencyPreferenceMarketData(asset.symbol, assetPrice);
  }

  /**
   * Get current market data for Rune Asset.
   */
  public async getRuneMarketData(
    asset: RuneCryptoAssetInfo,
    signal?: AbortSignal
  ): Promise<MarketData> {
    const btcMarketData = await this.getNativeAssetMarketData(btcCryptoAsset, signal);
    const runeTickerInfo = await this.bestInSlotApiClient.fetchRuneTickerInfo(
      asset.runeName,
      signal
    );
    const runeFiatPrice = baseCurrencyAmountInQuote(
      createMoney(initBigNumber(runeTickerInfo.avg_unit_price_in_sats ?? 0), 'BTC'),
      btcMarketData
    );

    return await this.buildFiatCurrencyPreferenceMarketData(
      runeTickerInfo.rune_name,
      runeFiatPrice.amount
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

    return await this.buildFiatCurrencyPreferenceMarketData(asset.symbol, brc20FiatPrice.amount);
  }

  private async buildFiatCurrencyPreferenceMarketData(
    assetSymbol: string,
    assetPriceUsd: BigNumber
  ) {
    return createMarketData(
      createMarketPair(assetSymbol, this.settingsService.getSettings().fiatCurrency),
      createMoney(
        this.settingsService.getSettings().fiatCurrency === 'USD'
          ? assetPriceUsd
          : assetPriceUsd.times(await this.readFiatCurrencyPreferenceExchangeRate()),
        this.settingsService.getSettings().fiatCurrency
      )
    );
  }

  private async readFiatCurrencyPreferenceExchangeRate() {
    const exchangeRates = await this.leatherApiClient.fetchFiatExchangeRates();
    return initBigNumber(
      exchangeRates.rates[
        this.settingsService.getSettings().fiatCurrency as keyof typeof exchangeRates.rates
      ]
    );
  }
}
