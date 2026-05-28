import { inject, injectable } from 'inversify';

import {
  CryptoAssetProtocols,
  FungibleCryptoAsset,
  HistoricalPeriod,
  MarketPriceHistory,
} from '@leather.io/models';
import { assertUnreachable, quoteCurrencyAmountToBase } from '@leather.io/utils';

import {
  LeatherApiClient,
  LeatherApiTokenPriceHistory,
} from '../infrastructure/api/leather/leather-api.client';
import type { SettingsService } from '../infrastructure/settings/settings.service';
import { Types } from '../inversify.types';
import { MarketDataService } from './market-data.service';
import { convertApiPriceSnapshots } from './market-history.utils';

@injectable()
export class MarketHistoryService {
  constructor(
    private readonly leatherApiClient: LeatherApiClient,
    @inject(Types.SettingsService) private readonly settingsService: SettingsService,
    private readonly marketDataService: MarketDataService
  ) {}

  public async getPriceChangePercentage(
    asset: FungibleCryptoAsset,
    period: HistoricalPeriod = '1d',
    signal?: AbortSignal
  ): Promise<number> {
    const history = await this.getPriceHistory(asset, period, signal);
    return history.changePercentage;
  }

  public async getPriceHistory(
    asset: FungibleCryptoAsset,
    period: HistoricalPeriod = '1d',
    signal?: AbortSignal
  ): Promise<MarketPriceHistory> {
    const { changePercentage, snapshots } = await this.fetchLeatherApiTokenPriceHistory(
      asset,
      period,
      signal
    );
    const prices = convertApiPriceSnapshots(snapshots);
    if (this.settingsService.getSettings().quoteCurrency !== 'USD') {
      // convert USD prices to quote currency
      const usdExchangeRate = await this.marketDataService.getUsdExchangeRate(
        this.settingsService.getSettings().quoteCurrency,
        signal
      );
      return {
        period,
        changePercentage: changePercentage ?? 0,
        prices: prices.map(s => ({
          price: quoteCurrencyAmountToBase(s.price, usdExchangeRate, asset.decimals),
          timestamp: s.timestamp,
        })),
      };
    } else {
      return {
        period,
        prices,
        changePercentage: changePercentage ?? 0,
      };
    }
  }

  private async fetchLeatherApiTokenPriceHistory(
    asset: FungibleCryptoAsset,
    period: HistoricalPeriod,
    signal?: AbortSignal
  ): Promise<LeatherApiTokenPriceHistory> {
    switch (asset.protocol) {
      case CryptoAssetProtocols.nativeBtc:
      case CryptoAssetProtocols.nativeStx:
        return this.leatherApiClient.fetchNativeTokenHistory(asset.symbol, period, { signal });
      case CryptoAssetProtocols.sip10:
        return this.leatherApiClient.fetchSip10TokenHistory(asset.contractId, period, { signal });
      default:
        return assertUnreachable(asset);
    }
  }
}
