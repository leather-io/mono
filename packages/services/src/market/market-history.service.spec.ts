import { btcAsset } from '@leather.io/constants';
import {
  CryptoAssetProtocols,
  type FungibleCryptoAsset,
  type MarketData,
} from '@leather.io/models';
import { initBigNumber } from '@leather.io/utils';

import { type LeatherApiClient } from '../infrastructure/api/leather/leather-api.client';
import {
  type SettingsService,
  type UserSettings,
} from '../infrastructure/settings/settings.service';
import { createMock } from '../test/create-mock';
import { createMarketSip10Asset, createMarketUserSettings } from '../test/market-fixtures';
import { type MarketDataService } from './market-data.service';
import { MarketHistoryService } from './market-history.service';
import { convertApiPriceSnapshots } from './market-history.utils';

describe(MarketHistoryService.name, () => {
  const nativeTokenPriceChange = 1;
  const sip10TokenPriceChange = 2;

  const nativeTokenApiPriceHistory = {
    changePercentage: nativeTokenPriceChange,
    snapshots: [
      {
        price: 1,
        timestamp: '2025-06-26T12:00:00.000Z',
      },
    ],
  };
  const sip10TokenApiPriceHistory = {
    changePercentage: sip10TokenPriceChange,
    snapshots: [
      {
        price: 2,
        timestamp: '2025-06-27T12:00:00.000Z',
      },
    ],
  };

  const fetchNativeTokenHistory = vi.fn().mockResolvedValue(nativeTokenApiPriceHistory);
  const fetchSip10TokenHistory = vi.fn().mockResolvedValue(sip10TokenApiPriceHistory);
  const mockLeatherApiClient = createMock<LeatherApiClient>({
    fetchNativeTokenHistory,
    fetchSip10TokenHistory,
  });

  const getSettings = vi.fn<() => UserSettings>().mockReturnValue(createMarketUserSettings('USD'));
  const mockSettingsService: SettingsService = { getSettings };

  const getUsdExchangeRate = vi.fn().mockResolvedValue(1);
  const mockMarketDataService = createMock<MarketDataService>({ getUsdExchangeRate });

  const marketHistoryService = new MarketHistoryService(
    mockLeatherApiClient,
    mockSettingsService,
    mockMarketDataService
  );

  describe('getPriceChangePercentage', () => {
    it('should return the price change percentage from the Leather API', async () => {
      const contractId = 'contractId';
      const signal = new AbortController().signal;
      const period = '1d';

      const nativeAssetPriceChange = await marketHistoryService.getPriceChangePercentage(
        btcAsset,
        period,
        signal
      );
      const sip10AssetPriceChange = await marketHistoryService.getPriceChangePercentage(
        createMarketSip10Asset({ contractId, protocol: CryptoAssetProtocols.sip10 }),
        period,
        signal
      );

      expect(mockLeatherApiClient.fetchNativeTokenHistory).toHaveBeenCalledWith(
        btcAsset.symbol,
        period,
        {
          signal,
        }
      );
      expect(mockLeatherApiClient.fetchSip10TokenHistory).toHaveBeenCalledWith(contractId, period, {
        signal,
      });

      expect(nativeAssetPriceChange).toEqual(nativeAssetPriceChange);
      expect(sip10AssetPriceChange).toEqual(sip10AssetPriceChange);
    });

    it('should throw an error if the asset protocol is not supported', async () => {
      const signal = new AbortController().signal;
      const asset: FungibleCryptoAsset = { ...btcAsset };
      Reflect.set(asset, 'protocol', 'unsupported');
      await expect(
        marketHistoryService.getPriceChangePercentage(asset, '1d', signal)
      ).rejects.toThrow();
    });
  });

  describe('getAssetPriceHistory', () => {
    it('should return the asset price history from the Leather API', async () => {
      const contractId = 'contractId';
      const signal = new AbortController().signal;
      const period = '1d';

      const nativeAssetPriceHistory = await marketHistoryService.getPriceHistory(
        btcAsset,
        period,
        signal
      );
      const sip10AssetPriceHistory = await marketHistoryService.getPriceHistory(
        createMarketSip10Asset({ contractId, protocol: CryptoAssetProtocols.sip10 }),
        period,
        signal
      );

      expect(mockLeatherApiClient.fetchNativeTokenHistory).toHaveBeenCalledWith(
        btcAsset.symbol,
        period,
        {
          signal,
        }
      );
      expect(mockLeatherApiClient.fetchSip10TokenHistory).toHaveBeenCalledWith(contractId, period, {
        signal,
      });

      expect(nativeAssetPriceHistory).toEqual({
        period,
        changePercentage: nativeTokenPriceChange,
        prices: convertApiPriceSnapshots(nativeTokenApiPriceHistory.snapshots),
      });
      expect(sip10AssetPriceHistory).toEqual({
        period,
        changePercentage: sip10TokenPriceChange,
        prices: convertApiPriceSnapshots(sip10TokenApiPriceHistory.snapshots),
      });
    });

    it('should adapt price history currency to the users quote currency setting', async () => {
      const userQuoteCurrency = 'EUR';

      getSettings.mockReturnValue(createMarketUserSettings(userQuoteCurrency));
      const usdExchangeRate: MarketData = {
        pair: {
          quote: 'USD',
          base: userQuoteCurrency,
        },
        price: {
          amount: initBigNumber(1.1),
          symbol: 'USD',
          decimals: 2,
        },
      };
      getUsdExchangeRate.mockResolvedValue(usdExchangeRate);

      const signal = new AbortController().signal;

      const priceHistory = await marketHistoryService.getPriceHistory(btcAsset, '1d', signal);
      expect(mockMarketDataService.getUsdExchangeRate).toHaveBeenCalledWith(
        userQuoteCurrency,
        signal
      );
      expect(priceHistory.prices[0].price.symbol).toEqual(userQuoteCurrency);
    });
  });
});
