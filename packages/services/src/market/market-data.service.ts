import { inject, injectable } from 'inversify';

import { btcAsset, currencyDecimalsMap } from '@leather.io/constants';
import {
  Brc20Asset,
  FungibleCryptoAsset,
  MarketData,
  NativeCryptoAsset,
  QuoteCurrency,
  RuneAsset,
  Sip10Asset,
  createMarketData,
  createMarketPair,
} from '@leather.io/models';
import {
  baseCurrencyAmountInQuote,
  convertAmountToFractionalUnit,
  createMoney,
  getAssetId,
  initBigNumber,
  invertExchangeRate,
  rebaseMarketData,
  serializeAssetId,
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
    asset: FungibleCryptoAsset,
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

  public async getMarketDataBatch(
    assets: FungibleCryptoAsset[],
    signal?: AbortSignal
  ): Promise<Record<string, MarketData>> {
    if (!assets.length) return {};

    const uniqueAssetsById = new Map<string, FungibleCryptoAsset>();
    for (const asset of assets) {
      uniqueAssetsById.set(serializeAssetId(getAssetId(asset)), asset);
    }
    const uniqueAssets = Array.from(uniqueAssetsById.values());

    const nativeAssets: NativeCryptoAsset[] = [];
    const sip10Assets: Sip10Asset[] = [];
    const runeAssets: RuneAsset[] = [];
    const brc20Assets: Brc20Asset[] = [];

    for (const asset of uniqueAssets) {
      switch (asset.protocol) {
        case 'nativeBtc':
        case 'nativeStx':
          nativeAssets.push(asset);
          break;
        case 'sip10':
          sip10Assets.push(asset);
          break;
        case 'rune':
          runeAssets.push(asset);
          break;
        case 'brc20':
          brc20Assets.push(asset);
          break;
        default:
          throw Error('Market data not supported for asset type: ' + asset.protocol);
      }
    }

    const shouldFetchNativeMap = nativeAssets.length > 0 || brc20Assets.length > 0;
    const [nativePriceMap, sip10PriceMap, runePriceMap] = await Promise.all([
      shouldFetchNativeMap
        ? this.leatherApiClient.fetchNativeTokenPriceMap({ signal })
        : Promise.resolve<Record<string, { price: number }>>({}),
      sip10Assets.length
        ? this.leatherApiClient.fetchSip10PriceMap({ signal })
        : Promise.resolve<Record<string, { price: number }>>({}),
      runeAssets.length
        ? this.leatherApiClient.fetchRunePriceMap({ signal })
        : Promise.resolve<Record<string, { price: number }>>({}),
    ]);

    const marketDataUsdEntries = new Map<string, MarketData>();

    if (nativeAssets.length) {
      for (const asset of nativeAssets) {
        const price = nativePriceMap?.[asset.symbol]?.price ?? 0;
        const nativeAssetPriceUsd = createMoney(
          convertAmountToFractionalUnit(initBigNumber(price), currencyDecimalsMap['USD']),
          'USD'
        );
        marketDataUsdEntries.set(
          serializeAssetId(getAssetId(asset)),
          createMarketData(createMarketPair(asset.symbol, 'USD'), nativeAssetPriceUsd)
        );
      }
    }

    if (sip10Assets.length) {
      for (const asset of sip10Assets) {
        const tokenPrice = sip10PriceMap?.[asset.contractId]?.price ?? 0;
        const tokenPriceUsd = createMoney(
          convertAmountToFractionalUnit(initBigNumber(tokenPrice), currencyDecimalsMap['USD']),
          'USD'
        );
        marketDataUsdEntries.set(
          serializeAssetId(getAssetId(asset)),
          createMarketData(createMarketPair(asset.symbol, 'USD'), tokenPriceUsd)
        );
      }
    }

    if (runeAssets.length) {
      await Promise.all(
        runeAssets.map(async asset => {
          let runePrice = runePriceMap?.[asset.runeName];
          if (!runePrice) {
            runePrice = await this.leatherApiClient.fetchRunePrice(asset.runeName, { signal });
          }
          const runePriceUsd = createMoney(
            convertAmountToFractionalUnit(
              initBigNumber(runePrice?.price ?? 0),
              currencyDecimalsMap['USD']
            ),
            'USD'
          );
          marketDataUsdEntries.set(
            serializeAssetId(getAssetId(asset)),
            createMarketData(createMarketPair(asset.runeName, 'USD'), runePriceUsd)
          );
        })
      );
    }

    if (brc20Assets.length) {
      const btcPrice = nativePriceMap?.[btcAsset.symbol]?.price ?? 0;
      const btcPriceUsd = createMoney(
        convertAmountToFractionalUnit(initBigNumber(btcPrice), currencyDecimalsMap['USD']),
        'USD'
      );
      const btcMarketData = createMarketData(createMarketPair(btcAsset.symbol, 'USD'), btcPriceUsd);

      await Promise.all(
        brc20Assets.map(async asset => {
          const bisMarketInfo = await this.bestInSlotApiClient.fetchBrc20MarketInfo(asset.symbol, {
            signal,
          });
          const brc20PriceUsd = baseCurrencyAmountInQuote(
            createMoney(bisMarketInfo.min_listed_unit_price ?? 0, 'BTC'),
            btcMarketData
          );
          marketDataUsdEntries.set(
            serializeAssetId(getAssetId(asset)),
            createMarketData(createMarketPair(asset.symbol, 'USD'), brc20PriceUsd)
          );
        })
      );
    }

    if (!marketDataUsdEntries.size) return {};

    const quoteCurrency = this.settingsService.getSettings().quoteCurrency;
    if (quoteCurrency === 'USD') {
      return Object.fromEntries(marketDataUsdEntries);
    }

    const usdExchangeRate = await this.getUsdExchangeRate(quoteCurrency, signal);
    const rebasedEntries = Array.from(marketDataUsdEntries.entries()).map(([assetId, data]) => [
      assetId,
      rebaseMarketData(data, usdExchangeRate),
    ]);
    return Object.fromEntries(rebasedEntries);
  }

  /**
   * Retrieves asset market data quoted in USD.
   */
  public async getMarketDataUsd(
    asset: FungibleCryptoAsset,
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
              (await this.leatherApiClient.fetchNativeTokenPriceMap({ signal }))[base].price
            ),
            currencyDecimalsMap['USD']
          ),
          'USD'
        )
      );
    } else {
      // Leather API returns USD/Fiat rates, need to invert to get Fiat/USD
      const usdExchangeRates = await this.leatherApiClient.fetchUsdExchangeRates({ signal });
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
    asset: NativeCryptoAsset,
    signal?: AbortSignal
  ): Promise<MarketData> {
    const priceMap = await this.leatherApiClient.fetchNativeTokenPriceMap({ signal });
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
    asset: Sip10Asset,
    signal?: AbortSignal
  ): Promise<MarketData> {
    const tokenPriceMap = await this.leatherApiClient.fetchSip10PriceMap({ signal });
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

  private async getRuneMarketDataUsd(asset: RuneAsset, signal?: AbortSignal): Promise<MarketData> {
    const runePriceMap = await this.leatherApiClient.fetchRunePriceMap({ signal });

    const runePriceUsd = runePriceMap[asset.runeName]
      ? runePriceMap[asset.runeName]
      : await this.leatherApiClient.fetchRunePrice(asset.runeName, { signal });

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
    asset: Brc20Asset,
    signal?: AbortSignal
  ): Promise<MarketData> {
    const [btcMarketData, bisMarketInfo] = await Promise.all([
      await this.getNativeAssetMarketDataUsd(btcAsset, signal),
      await this.bestInSlotApiClient.fetchBrc20MarketInfo(asset.symbol, { signal }),
    ]);
    const brc20PriceUsd = baseCurrencyAmountInQuote(
      createMoney(bisMarketInfo.min_listed_unit_price ?? 0, 'BTC'),
      btcMarketData
    );
    return createMarketData(createMarketPair(asset.symbol, 'USD'), brc20PriceUsd);
  }
}
