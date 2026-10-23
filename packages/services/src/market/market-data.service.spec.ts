import { btcAsset, stxAsset } from '@leather.io/constants';
import { initBigNumber } from '@leather.io/utils';

import type { FungibleAssetService } from '../assets/fungible-asset.service';
import { type LeatherApiClient } from '../infrastructure/api/leather/leather-api.client';
import {
  type SettingsService,
  type UserSettings,
} from '../infrastructure/settings/settings.service';
import { createMock } from '../test/create-mock';
import { createMarketSip10Asset, createMarketUserSettings } from '../test/market-fixtures';
import { MarketDataService } from './market-data.service';

describe(MarketDataService.name, () => {
  const mockSettingsService: SettingsService = {
    getSettings: vi.fn<() => UserSettings>().mockReturnValue(createMarketUserSettings('EUR')),
  };

  const mockLeatherApiClient = createMock<LeatherApiClient>({
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
    fetchUsdExchangeRates: vi.fn().mockReturnValue({
      rates: {
        EUR: 0.8,
        JPY: 200,
      },
    }),
  });

  const mockFungibleAssetService = createMock<FungibleAssetService>({
    getAsset: vi.fn().mockReturnValue(stxAsset),
  });

  const marketDataService = new MarketDataService(
    mockSettingsService,
    mockLeatherApiClient,
    mockFungibleAssetService
  );

  describe(MarketDataService.prototype.getMarketDataUsd.name, () => {
    it('should return native asset market data in USD', async () => {
      const stxMarketData = await marketDataService.getMarketDataUsd(stxAsset);
      const btcMarketData = await marketDataService.getMarketDataUsd(btcAsset);

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
      const sip10MarketData = await marketDataService.getMarketDataUsd(
        createMarketSip10Asset({
          contractId: 'SP123.some-token',
          symbol: 'SOME',
        })
      );

      expect(sip10MarketData.pair.base).toEqual('SOME');
      expect(sip10MarketData.pair.quote).toEqual('USD');
      expect(sip10MarketData.price.amount).toEqual(initBigNumber(4));
      expect(sip10MarketData.price.symbol).toEqual('USD');
    });
  });

  describe(MarketDataService.prototype.getMarketData.name, () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should return native asset market data in the users quote currency', async () => {
      const stxMarketData = await marketDataService.getMarketData(stxAsset);
      expect(stxMarketData.pair.base).toEqual('STX');
      expect(stxMarketData.pair.quote).toEqual('EUR');
      expect(stxMarketData.price.amount).toEqual(initBigNumber(160));
      expect(stxMarketData.price.symbol).toEqual('EUR');
    });

    it('should return sip10 asset market data in the users quote currency', async () => {
      const sip10MarketData = await marketDataService.getMarketData(
        createMarketSip10Asset({
          contractId: 'SP123.some-token',
          symbol: 'SOME',
        })
      );

      expect(sip10MarketData.pair.base).toEqual('SOME');
      expect(sip10MarketData.pair.quote).toEqual('EUR');
      expect(sip10MarketData.price.amount).toEqual(initBigNumber(3.2));
      expect(sip10MarketData.price.symbol).toEqual('EUR');
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
