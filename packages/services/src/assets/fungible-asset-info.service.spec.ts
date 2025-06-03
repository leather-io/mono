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
import { MarketDataService } from '../market-data/market-data.service';
import { FungibleAssetInfoService } from './fungible-asset-info.service';
import { mapPriceHistory } from './fungible-asset-info.utils';

describe(FungibleAssetInfoService.name, () => {
  const nativeTokenDescription = 'nativeTokenDescription';
  const sip10TokenDescription = 'sip10TokenDescription';
  const runeDescription = 'runeDescription';

  const nativeTokenPriceChange = 1;
  const sip10TokenPriceChange = 2;
  const runePriceChange = 3;

  const nativeTokenPriceHistory = [
    {
      price: 1,
      timestamp: '2025-06-26T12:00:00.000Z',
    },
  ];
  const sip10TokenPriceHistory = [
    {
      price: 2,
      timestamp: '2025-06-27T12:00:00.000Z',
    },
  ];
  const runePriceHistory = [
    {
      price: 3,
      timestamp: '2025-06-28T12:00:00.000Z',
    },
  ];

  const mockLeatherApiClient = {
    fetchNativeTokenDescription: vi.fn().mockResolvedValue({
      description: nativeTokenDescription,
    }),
    fetchSip10TokenDescription: vi.fn().mockResolvedValue({
      description: sip10TokenDescription,
    }),
    fetchRuneDescription: vi.fn().mockResolvedValue({
      description: runeDescription,
    }),
    fetchNativeTokenPrice: vi.fn().mockResolvedValue({
      change24h: nativeTokenPriceChange,
    }),
    fetchSip10Price: vi.fn().mockResolvedValue({
      change24h: sip10TokenPriceChange,
    }),
    fetchRunePrice: vi.fn().mockResolvedValue({
      change24h: runePriceChange,
    }),
    fetchNativeTokenHistory: vi.fn().mockResolvedValue(nativeTokenPriceHistory),
    fetchSip10TokenHistory: vi.fn().mockResolvedValue(sip10TokenPriceHistory),
    fetchRuneHistory: vi.fn().mockResolvedValue(runePriceHistory),
  } as unknown as LeatherApiClient;

  const mockSettingsService = {
    getSettings: vi.fn().mockReturnValue({
      quoteCurrency: 'USD',
    }),
  } as unknown as SettingsService;

  const mockMarketDataService = {
    getUsdExchangeRate: vi.fn().mockResolvedValue(1),
  } as unknown as MarketDataService;

  const fungibleAssetInfoService = new FungibleAssetInfoService(
    mockLeatherApiClient,
    mockSettingsService,
    mockMarketDataService
  );

  describe('getAssetDescription', () => {
    it('should return native asset descriptions from Leather API', async () => {
      const signal = new AbortController().signal;
      const description = await fungibleAssetInfoService.getAssetDescription(btcAsset, signal);

      expect(mockLeatherApiClient.fetchNativeTokenDescription).toHaveBeenCalledWith(
        btcAsset.symbol,
        signal
      );
      expect(description).toEqual({
        description: nativeTokenDescription,
      });
    });

    it('should return sip10 asset descriptions from Leather API', async () => {
      const contractId = 'contractId';

      const signal = new AbortController().signal;
      const description = await fungibleAssetInfoService.getAssetDescription(
        { contractId, protocol: CryptoAssetProtocols.sip10 } as Sip10Asset,
        signal
      );

      expect(mockLeatherApiClient.fetchSip10TokenDescription).toHaveBeenCalledWith(
        contractId,
        signal
      );
      expect(description).toEqual({
        description: sip10TokenDescription,
      });
    });

    it('should return rune asset descriptions from Leather API', async () => {
      const runeName = 'runeName';

      const signal = new AbortController().signal;
      const description = await fungibleAssetInfoService.getAssetDescription(
        { runeName, protocol: CryptoAssetProtocols.rune } as RuneAsset,
        signal
      );

      expect(mockLeatherApiClient.fetchRuneDescription).toHaveBeenCalledWith(runeName, signal);
      expect(description).toEqual({
        description: runeDescription,
      });
    });

    it('should throw an error if the asset protocol is not supported', async () => {
      const signal = new AbortController().signal;
      const asset = { protocol: 'unsupported' } as unknown as FungibleCryptoAsset;
      await expect(fungibleAssetInfoService.getAssetDescription(asset, signal)).rejects.toThrow();
    });
  });

  describe('getAssetPriceChange', () => {
    it('should return the correct asset 24hr price change from the Leather API', async () => {
      const contractId = 'contractId';
      const runeName = 'runeName';
      const signal = new AbortController().signal;

      const nativeAssetPriceChange = await fungibleAssetInfoService.getAssetPriceChange(
        btcAsset,
        '24h',
        signal
      );
      const sip10AssetPriceChange = await fungibleAssetInfoService.getAssetPriceChange(
        { contractId, protocol: CryptoAssetProtocols.sip10 } as Sip10Asset,
        '24h',
        signal
      );
      const runeAssetPriceChange = await fungibleAssetInfoService.getAssetPriceChange(
        { runeName, protocol: CryptoAssetProtocols.rune } as RuneAsset,
        '24h',
        signal
      );

      expect(mockLeatherApiClient.fetchNativeTokenPrice).toHaveBeenCalledWith(
        btcAsset.symbol,
        signal
      );
      expect(mockLeatherApiClient.fetchSip10Price).toHaveBeenCalledWith(contractId, signal);
      expect(mockLeatherApiClient.fetchRunePrice).toHaveBeenCalledWith(runeName, signal);

      expect(nativeAssetPriceChange).toEqual({
        period: '24h',
        changePercent: nativeTokenPriceChange,
      });
      expect(sip10AssetPriceChange).toEqual({
        period: '24h',
        changePercent: sip10TokenPriceChange,
      });
      expect(runeAssetPriceChange).toEqual({
        period: '24h',
        changePercent: runePriceChange,
      });
    });

    it('should return 0 if the period is not 24h', async () => {
      const signal = new AbortController().signal;
      const priceChange = await fungibleAssetInfoService.getAssetPriceChange(
        btcAsset,
        '7d',
        signal
      );
      expect(priceChange).toEqual({
        period: '7d',
        changePercent: 0,
      });
    });

    it('should throw an error if the asset protocol is not supported', async () => {
      const signal = new AbortController().signal;
      const asset = { protocol: 'unsupported' } as unknown as FungibleCryptoAsset;
      await expect(
        fungibleAssetInfoService.getAssetPriceChange(asset, '24h', signal)
      ).rejects.toThrow();
    });
  });

  describe('getAssetPriceHistory', () => {
    it('should return the correct asset price history from the Leather API', async () => {
      const contractId = 'contractId';
      const runeName = 'runeName';
      const signal = new AbortController().signal;

      const nativeAssetPriceHistory = await fungibleAssetInfoService.getAssetPriceHistory(
        btcAsset,
        '24h',
        signal
      );
      const sip10AssetPriceHistory = await fungibleAssetInfoService.getAssetPriceHistory(
        { contractId, protocol: CryptoAssetProtocols.sip10 } as Sip10Asset,
        '24h',
        signal
      );
      const runeAssetPriceHistory = await fungibleAssetInfoService.getAssetPriceHistory(
        { runeName, protocol: CryptoAssetProtocols.rune } as RuneAsset,
        '24h',
        signal
      );

      expect(mockLeatherApiClient.fetchNativeTokenHistory).toHaveBeenCalledWith(
        btcAsset.symbol,
        signal
      );
      expect(mockLeatherApiClient.fetchSip10TokenHistory).toHaveBeenCalledWith(contractId, signal);
      expect(mockLeatherApiClient.fetchRuneHistory).toHaveBeenCalledWith(runeName, signal);

      expect(nativeAssetPriceHistory).toEqual({
        period: '24h',
        prices: mapPriceHistory(nativeTokenPriceHistory),
      });
      expect(sip10AssetPriceHistory).toEqual({
        period: '24h',
        prices: mapPriceHistory(sip10TokenPriceHistory),
      });
      expect(runeAssetPriceHistory).toEqual({
        period: '24h',
        prices: mapPriceHistory(runePriceHistory),
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

      const priceHistory = await fungibleAssetInfoService.getAssetPriceHistory(
        btcAsset,
        '24h',
        signal
      );
      expect(mockMarketDataService.getUsdExchangeRate).toHaveBeenCalledWith(
        userQuoteCurrency,
        signal
      );
      expect(priceHistory.prices[0].price.symbol).toEqual(userQuoteCurrency);
    });
  });
});
