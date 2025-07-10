import { inject, injectable } from 'inversify';

import { CryptoAssetProtocols, FungibleCryptoAsset } from '@leather.io/models';
import { quoteCurrencyAmountToBase } from '@leather.io/utils';

import {
  LeatherApiClient,
  LeatherApiLocale,
  LeatherApiTokenPriceHistory,
} from '../infrastructure/api/leather/leather-api.client';
import type { SettingsService } from '../infrastructure/settings/settings.service';
import { Types } from '../inversify.types';
import { MarketDataService } from '../market-data/market-data.service';
import {
  AssetDescription,
  AssetPriceChange,
  AssetPriceHistory,
  PriceHistoryPeriod,
} from '../types/asset.types';
import { mapPriceHistory } from './fungible-asset-info.utils';

@injectable()
export class FungibleAssetInfoService {
  constructor(
    private readonly leatherApiClient: LeatherApiClient,
    @inject(Types.SettingsService) private readonly settingsService: SettingsService,
    private readonly marketDataService: MarketDataService
  ) {}

  public async getAssetDescription(
    asset: FungibleCryptoAsset,
    locale: LeatherApiLocale,
    signal?: AbortSignal
  ): Promise<AssetDescription> {
    switch (asset.protocol) {
      case CryptoAssetProtocols.nativeBtc:
      case CryptoAssetProtocols.nativeStx:
        return await this.leatherApiClient.fetchNativeTokenDescription(
          asset.symbol,
          locale,
          signal
        );
      case CryptoAssetProtocols.sip10:
        return await this.leatherApiClient.fetchSip10TokenDescription(
          asset.contractId,
          locale,
          signal
        );
      case CryptoAssetProtocols.rune:
        return await this.leatherApiClient.fetchRuneDescription(asset.runeName, locale, signal);
      default:
        throw Error('Asset descriptions not supported for asset type: ' + asset.protocol);
    }
  }

  public async getAssetPriceChange(
    asset: FungibleCryptoAsset,
    period: PriceHistoryPeriod,
    signal?: AbortSignal
  ): Promise<AssetPriceChange> {
    const changePercent =
      period === '24h' ? ((await this.getTokenPriceChange24h(asset, signal)) ?? 0) : 0;

    return {
      period,
      changePercent,
    };
  }

  public async getAssetPriceHistory(
    asset: FungibleCryptoAsset,
    period: PriceHistoryPeriod,
    signal?: AbortSignal
  ): Promise<AssetPriceHistory> {
    const prices =
      period === '24h'
        ? mapPriceHistory(await this.getLeatherApiTokenPriceHistory24h(asset, signal))
        : [];

    if (this.settingsService.getSettings().quoteCurrency !== 'USD' && prices.length > 0) {
      const usdExchangeRate = await this.marketDataService.getUsdExchangeRate(
        this.settingsService.getSettings().quoteCurrency,
        signal
      );
      return {
        period,
        prices: prices.map(p => ({
          price: quoteCurrencyAmountToBase(p.price, usdExchangeRate),
          timestamp: p.timestamp,
        })),
      };
    }

    return {
      period,
      prices,
    };
  }

  private async getLeatherApiTokenPriceHistory24h(
    asset: FungibleCryptoAsset,
    signal?: AbortSignal
  ): Promise<LeatherApiTokenPriceHistory> {
    switch (asset.protocol) {
      case CryptoAssetProtocols.nativeBtc:
      case CryptoAssetProtocols.nativeStx:
        return this.leatherApiClient.fetchNativeTokenHistory(asset.symbol, signal);
      case CryptoAssetProtocols.sip10:
        return this.leatherApiClient.fetchSip10TokenHistory(asset.contractId, signal);
      case CryptoAssetProtocols.rune:
        return this.leatherApiClient.fetchRuneHistory(asset.runeName, signal);
      default:
        throw Error('Price history not supported for asset type: ' + asset.protocol);
    }
  }

  private async getTokenPriceChange24h(
    asset: FungibleCryptoAsset,
    signal?: AbortSignal
  ): Promise<number | null> {
    switch (asset.protocol) {
      case CryptoAssetProtocols.nativeBtc:
      case CryptoAssetProtocols.nativeStx:
        return (await this.leatherApiClient.fetchNativeTokenPrice(asset.symbol, signal)).change24h;
      case CryptoAssetProtocols.sip10:
        return (await this.leatherApiClient.fetchSip10Price(asset.contractId, signal)).change24h;
      case CryptoAssetProtocols.rune:
        return (await this.leatherApiClient.fetchRunePrice(asset.runeName, signal)).change24h;
      default:
        throw Error('Price change not supported for asset type: ' + asset.protocol);
    }
  }
}
