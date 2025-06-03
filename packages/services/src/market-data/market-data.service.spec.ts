import { btcCryptoAsset, stxCryptoAsset } from '@leather.io/constants';
import { RuneCryptoAssetInfo, Sip10CryptoAssetInfo } from '@leather.io/models';
import { initBigNumber } from '@leather.io/utils';

import { BestInSlotApiClient } from '../infrastructure/api/best-in-slot/best-in-slot-api.client';
import { LeatherApiClient } from '../infrastructure/api/leather/leather-api.client';
import { SettingsService } from '../infrastructure/settings/settings.service';
import { MarketDataService } from './market-data.service';

describe(MarketDataService.name, () => {
  const mockSettingsService = {
    getSettings: vi.fn().mockReturnValue({ quoteCurrency: 'EUR' }),
  } as unknown as SettingsService;

  const mockLeatherApiClient = {
    fetchNativeTokenPriceMap: vi.fn().mockReturnValue({
      STX: {
        price: 2,
      },
      BTC: {
        price: 100000,
      },
    }),
    fetchSip10PriceMap: vi.fn().mockReturnValue({
      'SP123.some-token': {
        price: 0.04,
      },
    }),
    fetchRunePriceMap: vi.fn().mockReturnValue({
      SOMERUNE: {
        price: 0.001,
      },
    }),
    fetchUsdExchangeRates: vi.fn().mockReturnValue({
      rates: {
        EUR: 0.8,
        JPY: 200,
      },
    }),
  } as unknown as LeatherApiClient;

  const mockBestInSlotApiClient = {
    getMarketData: vi.fn(),
  } as unknown as BestInSlotApiClient;

  const marketDataService = new MarketDataService(
    mockSettingsService,
    mockLeatherApiClient,
    mockBestInSlotApiClient
  );

  describe(MarketDataService.prototype.getMarketDataUsd.name, () => {
    it('should return native asset market data in USD', async () => {
      const stxMarketData = await marketDataService.getMarketDataUsd(stxCryptoAsset);
      const btcMarketData = await marketDataService.getMarketDataUsd(btcCryptoAsset);

      expect(stxMarketData.pair.base).toEqual('STX');
      expect(stxMarketData.pair.quote).toEqual('USD');
      expect(stxMarketData.price.amount).toEqual(initBigNumber(200));
      expect(stxMarketData.price.symbol).toEqual('USD');

      expect(btcMarketData.pair.base).toEqual('BTC');
      expect(btcMarketData.pair.quote).toEqual('USD');
      expect(btcMarketData.price.amount).toEqual(initBigNumber(10000000));
      expect(btcMarketData.price.symbol).toEqual('USD');
    });

    it('should return sip10 asset market data in USD', async () => {
      const sip10MarketData = await marketDataService.getMarketDataUsd({
        protocol: 'sip10',
        contractId: 'SP123.some-token',
        symbol: 'SOME',
      } as Sip10CryptoAssetInfo);

      expect(sip10MarketData.pair.base).toEqual('SOME');
      expect(sip10MarketData.pair.quote).toEqual('USD');
      expect(sip10MarketData.price.amount).toEqual(initBigNumber(4));
      expect(sip10MarketData.price.symbol).toEqual('USD');
    });

    it('should return rune asset market data in USD', async () => {
      const runeMarketData = await marketDataService.getMarketDataUsd({
        protocol: 'rune',
        runeName: 'SOMERUNE',
        symbol: 'SOMERUNE',
      } as RuneCryptoAssetInfo);

      expect(runeMarketData.pair.base).toEqual('SOMERUNE');
      expect(runeMarketData.pair.quote).toEqual('USD');
      expect(runeMarketData.price.amount).toEqual(initBigNumber(0.1));
      expect(runeMarketData.price.symbol).toEqual('USD');
    });
  });

  describe(MarketDataService.prototype.getMarketData.name, () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should return native asset market data in the users quote currency', async () => {
      const stxMarketData = await marketDataService.getMarketData(stxCryptoAsset);
      expect(stxMarketData.pair.base).toEqual('STX');
      expect(stxMarketData.pair.quote).toEqual('EUR');
      expect(stxMarketData.price.amount).toEqual(initBigNumber(160));
      expect(stxMarketData.price.symbol).toEqual('EUR');
    });

    it('should return sip10 asset market data in the users quote currency', async () => {
      const sip10MarketData = await marketDataService.getMarketData({
        protocol: 'sip10',
        contractId: 'SP123.some-token',
        symbol: 'SOME',
      } as Sip10CryptoAssetInfo);

      expect(sip10MarketData.pair.base).toEqual('SOME');
      expect(sip10MarketData.pair.quote).toEqual('EUR');
      expect(sip10MarketData.price.amount).toEqual(initBigNumber(3.2));
      expect(sip10MarketData.price.symbol).toEqual('EUR');
    });

    it('should return rune asset market data in the users quote currency', async () => {
      const runeMarketData = await marketDataService.getMarketData({
        protocol: 'rune',
        runeName: 'SOMERUNE',
        symbol: 'SOMERUNE',
      } as RuneCryptoAssetInfo);

      expect(runeMarketData.pair.base).toEqual('SOMERUNE');
      expect(runeMarketData.pair.quote).toEqual('EUR');
      expect(runeMarketData.price.amount).toEqual(initBigNumber(0.08));
      expect(runeMarketData.price.symbol).toEqual('EUR');
    });
  });

  describe(MarketDataService.prototype.getUsdExchangeRate.name, () => {
    it('should return the correct <base>/USD exchange rate for the given quote currency', async () => {
      const eurUsdExchangeRate = await marketDataService.getUsdExchangeRate('EUR');
      expect(eurUsdExchangeRate.pair.base).toEqual('EUR');
      expect(eurUsdExchangeRate.pair.quote).toEqual('USD');
      expect(eurUsdExchangeRate.price.amount).toEqual(initBigNumber(125));
      expect(eurUsdExchangeRate.price.symbol).toEqual('USD');

      const jpyUsdExchangeRate = await marketDataService.getUsdExchangeRate('JPY');
      expect(jpyUsdExchangeRate.pair.base).toEqual('JPY');
      expect(jpyUsdExchangeRate.pair.quote).toEqual('USD');
      expect(jpyUsdExchangeRate.price.amount).toEqual(initBigNumber(0.5));
      expect(jpyUsdExchangeRate.price.symbol).toEqual('USD');

      const btcUsdExchangeRate = await marketDataService.getUsdExchangeRate('BTC');
      expect(btcUsdExchangeRate.pair.base).toEqual('BTC');
      expect(btcUsdExchangeRate.pair.quote).toEqual('USD');
      expect(btcUsdExchangeRate.price.amount).toEqual(initBigNumber(10000000));
      expect(btcUsdExchangeRate.price.symbol).toEqual('USD');

      const usdUsdExchangeRate = await marketDataService.getUsdExchangeRate('USD');
      expect(usdUsdExchangeRate.pair.base).toEqual('USD');
      expect(usdUsdExchangeRate.pair.quote).toEqual('USD');
      expect(usdUsdExchangeRate.price.amount).toEqual(initBigNumber(100));
      expect(usdUsdExchangeRate.price.symbol).toEqual('USD');
    });
  });
});
