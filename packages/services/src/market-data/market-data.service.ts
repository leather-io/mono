import { inject, injectable } from 'inversify';

import { btcCryptoAsset, currencyDecimalsMap } from '@leather.io/constants';
import {
  Brc20CryptoAssetInfo,
  FungibleCryptoAssetInfo,
  MarketData,
  NativeCryptoAssetInfo,
  QuoteCurrency,
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
  invertExchangeRate,
  rebaseMarketData,
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
   * Retrieves asset market data quoted in user's preferred quote currency.
   */
  public async getMarketData(
    asset: FungibleCryptoAssetInfo,
    signal?: AbortSignal
  ): Promise<MarketData> {
    const marketDataUsd: MarketData = await this.getMarketDataUsd(asset, signal);
    if (this.settingsService.getSettings().quoteCurrency === 'USD') {
      return marketDataUsd;
    }
    const usdExchangeRate = await this.getUsdExchangeRate(
      this.settingsService.getSettings().quoteCurrency,
      signal
    );
    return rebaseMarketData(marketDataUsd, usdExchangeRate);
  }

  /**
   * Retrieves asset market data quoted in USD.
   */
  public async getMarketDataUsd(
    asset: FungibleCryptoAssetInfo,
    signal?: AbortSignal
  ): Promise<MarketData> {
    switch (asset.protocol) {
      case 'nativeBtc':
      case 'nativeStx':
        return await this.getNativeAssetMarketDataUsd(asset, signal);
      case 'sip10':
        return await this.getSip10MarketDataUsd(asset, signal);
      case 'rune':
        return await this.getRuneMarketDataUsd(asset, signal);
      case 'brc20':
        return await this.getBrc20MarketDataUsd(asset, signal);
      default:
        throw Error('Market data not supported for asset type: ' + asset.protocol);
    }
  }

  /**
   * Get <XXX>/USD exchange rate, where "XXX" is any supported quote currency.
   */
  public async getUsdExchangeRate(base: QuoteCurrency, signal?: AbortSignal) {
    if (base === 'USD') {
      return createMarketData(createMarketPair(base, 'USD'), createMoney(100, 'USD'));
    } else if (base === 'BTC') {
      return createMarketData(
        createMarketPair(base, 'USD'),
        createMoney(
          convertAmountToFractionalUnit(
            initBigNumber(
              (await this.leatherApiClient.fetchNativeTokenPriceMap(signal))[base].price
            ),
            currencyDecimalsMap['USD']
          ),
          'USD'
        )
      );
    } else {
      // Leather API returns USD/Fiat rates, need to invert to get Fiat/USD
      const usdExchangeRates = await this.leatherApiClient.fetchUsdExchangeRates(signal);
      const usdToFiatRate = createMarketData(
        createMarketPair('USD', base),
        createMoney(
          convertAmountToFractionalUnit(
            initBigNumber(usdExchangeRates.rates[base as keyof typeof usdExchangeRates.rates]),
            currencyDecimalsMap[base]
          ),
          base
        )
      );

      return invertExchangeRate(usdToFiatRate);
    }
  }

  private async getNativeAssetMarketDataUsd(
    asset: NativeCryptoAssetInfo,
    signal?: AbortSignal
  ): Promise<MarketData> {
    const priceMap = await this.leatherApiClient.fetchNativeTokenPriceMap(signal);
    const nativeAssetPriceUsd = createMoney(
      convertAmountToFractionalUnit(
        initBigNumber(priceMap[asset.symbol].price),
        currencyDecimalsMap['USD']
      ),
      'USD'
    );
    return createMarketData(createMarketPair(asset.symbol, 'USD'), nativeAssetPriceUsd);
  }

  private async getSip10MarketDataUsd(
    asset: Sip10CryptoAssetInfo,
    signal?: AbortSignal
  ): Promise<MarketData> {
    const tokenPriceMap = await this.leatherApiClient.fetchSip10PriceMap(signal);
    const tokenPriceMatch = tokenPriceMap[asset.contractId];
    if (!tokenPriceMatch) {
      return createMarketData(createMarketPair(asset.symbol, 'USD'), createMoney(0, 'USD'));
    }
    return createMarketData(
      createMarketPair(asset.symbol, 'USD'),
      createMoney(
        convertAmountToFractionalUnit(
          initBigNumber(tokenPriceMatch.price),
          currencyDecimalsMap['USD']
        ),
        'USD'
      )
    );
  }

  private async getRuneMarketDataUsd(
    asset: RuneCryptoAssetInfo,
    signal?: AbortSignal
  ): Promise<MarketData> {
    const runePriceMap = await this.leatherApiClient.fetchRunePriceMap(signal);

    const runePriceUsd = runePriceMap[asset.runeName]
      ? runePriceMap[asset.runeName]
      : await this.leatherApiClient.fetchRunePrice(asset.runeName, signal);

    return createMarketData(
      createMarketPair(asset.runeName, 'USD'),
      createMoney(
        convertAmountToFractionalUnit(
          initBigNumber(runePriceUsd.price),
          currencyDecimalsMap['USD']
        ),
        'USD'
      )
    );
  }

  private async getBrc20MarketDataUsd(
    asset: Brc20CryptoAssetInfo,
    signal?: AbortSignal
  ): Promise<MarketData> {
    const [btcMarketData, bisMarketInfo] = await Promise.all([
      await this.getNativeAssetMarketDataUsd(btcCryptoAsset, signal),
      await this.bestInSlotApiClient.fetchBrc20MarketInfo(asset.symbol, signal),
    ]);
    const brc20PriceUsd = baseCurrencyAmountInQuote(
      createMoney(bisMarketInfo.min_listed_unit_price ?? 0, 'BTC'),
      btcMarketData
    );
    return createMarketData(createMarketPair(asset.symbol, 'USD'), brc20PriceUsd);
  }
}
