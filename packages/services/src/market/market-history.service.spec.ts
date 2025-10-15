import { btcAsset } from '@leather.io/constants';
import {
  CryptoAssetProtocols,
  FungibleCryptoAsset,
  MarketData,
  RuneAsset,
  Sip10Asset,
} from '@leather.io/models';
import { initBigNumber } from '@leather.io/utils';

import { LeatherApiClient } from '../infrastructure/api/leather/leather-api.client';
import { SettingsService } from '../infrastructure/settings/settings.service';
import { MarketDataService } from './market-data.service';
import { MarketHistoryService } from './market-history.service';
import { convertApiPriceSnapshots } from './market-history.utils';

describe(MarketHistoryService.name, () => {
  const nativeTokenPriceChange = 1;
  const sip10TokenPriceChange = 2;
  const runePriceChange = 3;

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
  const runeApiPriceHistory = {
    changePercentage: runePriceChange,
    snapshots: [
      {
        price: 3,
        timestamp: '2025-06-28T12:00:00.000Z',
      },
    ],
  };

  const mockLeatherApiClient = {
    fetchNativeTokenHistory: vi.fn().mockResolvedValue(nativeTokenApiPriceHistory),
    fetchSip10TokenHistory: vi.fn().mockResolvedValue(sip10TokenApiPriceHistory),
    fetchRuneHistory: vi.fn().mockResolvedValue(runeApiPriceHistory),
  } as unknown as LeatherApiClient;

  const mockSettingsService = {
    getSettings: vi.fn().mockReturnValue({
      quoteCurrency: 'USD',
    }),
  } as unknown as SettingsService;

  const mockMarketDataService = {
    getUsdExchangeRate: vi.fn().mockResolvedValue(1),
  } as unknown as MarketDataService;

  const marketHistoryService = new MarketHistoryService(
    mockLeatherApiClient,
    mockSettingsService,
    mockMarketDataService
  );

  describe('getPriceChangePercentage', () => {
    it('should return the price change percentage from the Leather API', async () => {
      const contractId = 'contractId';
      const runeName = 'runeName';
      const signal = new AbortController().signal;
      const period = '1d';

      const nativeAssetPriceChange = await marketHistoryService.getPriceChangePercentage(
        btcAsset,
        period,
        signal
      );
      const sip10AssetPriceChange = await marketHistoryService.getPriceChangePercentage(
        { contractId, protocol: CryptoAssetProtocols.sip10 } as Sip10Asset,
        period,
        signal
      );
      const runeAssetPriceChange = await marketHistoryService.getPriceChangePercentage(
        { runeName, protocol: CryptoAssetProtocols.rune } as RuneAsset,
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
      expect(mockLeatherApiClient.fetchRuneHistory).toHaveBeenCalledWith(runeName, period, {
        signal,
      });

      expect(nativeAssetPriceChange).toEqual(nativeAssetPriceChange);
      expect(sip10AssetPriceChange).toEqual(sip10AssetPriceChange);
      expect(runeAssetPriceChange).toEqual(runeAssetPriceChange);
    });

    it('should throw an error if the asset protocol is not supported', async () => {
      const signal = new AbortController().signal;
      const asset = { protocol: 'unsupported' } as unknown as FungibleCryptoAsset;
      await expect(
        marketHistoryService.getPriceChangePercentage(asset, '1d', signal)
      ).rejects.toThrow();
    });
  });

  describe('getAssetPriceHistory', () => {
    it('should return the asset price history from the Leather API', async () => {
      const contractId = 'contractId';
      const runeName = 'runeName';
      const signal = new AbortController().signal;
      const period = '1d';

      const nativeAssetPriceHistory = await marketHistoryService.getPriceHistory(
        btcAsset,
        period,
        signal
      );
      const sip10AssetPriceHistory = await marketHistoryService.getPriceHistory(
        { contractId, protocol: CryptoAssetProtocols.sip10 } as Sip10Asset,
        period,
        signal
      );
      const runeAssetPriceHistory = await marketHistoryService.getPriceHistory(
        { runeName, protocol: CryptoAssetProtocols.rune } as RuneAsset,
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
      expect(mockLeatherApiClient.fetchRuneHistory).toHaveBeenCalledWith(runeName, period, {
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
      expect(runeAssetPriceHistory).toEqual({
        period,
        changePercentage: runePriceChange,
        prices: convertApiPriceSnapshots(runeApiPriceHistory.snapshots),
      });
    });

    it('should adapt price history currency to the users quote currency setting', async () => {
      const userQuoteCurrency = 'EUR';

      mockSettingsService.getSettings = vi.fn().mockReturnValue({
        quoteCurrency: userQuoteCurrency,
      });
      mockMarketDataService.getUsdExchangeRate = vi.fn().mockResolvedValue({
        pair: {
          quote: 'USD',
          base: userQuoteCurrency,
        },
        price: {
          amount: initBigNumber(1.1),
          symbol: 'USD',
          decimals: 2,
        },
      } as MarketData);

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
