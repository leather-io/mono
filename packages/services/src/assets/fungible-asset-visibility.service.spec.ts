import { FungibleCryptoAssetProtocols } from '@leather.io/models';
import { serializeAssetId } from '@leather.io/utils';

import { type LeatherApiClient } from '../infrastructure/api/leather/leather-api.client';
import { type AppConfigService } from '../infrastructure/app-config/app-config.service';
import { type SettingsService } from '../infrastructure/settings/settings.service';
import { createMock } from '../test/create-mock';
import { FungibleAssetVisibilityService } from './fungible-asset-visibility.service';

describe(FungibleAssetVisibilityService.name, () => {
  const mockAppConfigService = createMock<AppConfigService>({
    getDefaultEnabledAssets: vi.fn().mockResolvedValue([]),
  });

  const mockLeatherApiClient = createMock<LeatherApiClient>({
    fetchSip10PriceMap: vi.fn().mockResolvedValue({}),
  });

  const mockSettingsService: SettingsService = {
    getSettings: vi.fn().mockReturnValue({}),
  };

  describe('getDefaultAssetVisibility', () => {
    it('should influence visibility based on default enabled assets', async () => {
      const defaultEnabledSip10 = 'DEFAULT_SIP10';

      const fungibleAssetVisibilityService = new FungibleAssetVisibilityService(
        createMock<AppConfigService>({
          getDefaultEnabledAssets: vi
            .fn()
            .mockResolvedValue([serializeAssetId({ protocol: 'sip10', id: defaultEnabledSip10 })]),
        }),
        mockLeatherApiClient,
        mockSettingsService
      );
      expect(
        await fungibleAssetVisibilityService.getDefaultAssetVisibility({
          protocol: 'sip10',
          id: defaultEnabledSip10,
        })
      ).toEqual(true);
      expect(
        await fungibleAssetVisibilityService.getDefaultAssetVisibility({
          protocol: 'sip10',
          id: 'not-enabled',
        })
      ).toEqual(false);
    });

    it('should influence visibility based on asset pricing', async () => {
      const pricedSip10 = 'PRICED_SIP10';

      const fungibleAssetVisibilityService = new FungibleAssetVisibilityService(
        mockAppConfigService,
        createMock<LeatherApiClient>({
          fetchSip10PriceMap: vi.fn().mockResolvedValue({ [pricedSip10]: 1 }),
        }),
        mockSettingsService
      );
      expect(
        await fungibleAssetVisibilityService.getDefaultAssetVisibility({
          protocol: 'sip10',
          id: pricedSip10,
        })
      ).toEqual(true);
      expect(
        await fungibleAssetVisibilityService.getDefaultAssetVisibility({
          protocol: 'sip10',
          id: 'not-priced',
        })
      ).toEqual(false);
    });

    it('should only show allowlisted assets under an allowlist policy', async () => {
      const allowlistedSip10 = 'ALLOWLISTED_SIP10';
      const defaultEnabledSip10 = 'DEFAULT_SIP10';
      const pricedSip10 = 'PRICED_SIP10';

      const fungibleAssetVisibilityService = new FungibleAssetVisibilityService(
        createMock<AppConfigService>({
          getDefaultEnabledAssets: vi
            .fn()
            .mockResolvedValue([serializeAssetId({ protocol: 'sip10', id: defaultEnabledSip10 })]),
        }),
        createMock<LeatherApiClient>({
          fetchSip10PriceMap: vi.fn().mockResolvedValue({ [pricedSip10]: 1 }),
        }),
        {
          getSettings: vi.fn().mockReturnValue({
            assetVisibility: {},
            defaultAssetVisibility: {
              type: 'allowlist',
              assets: [serializeAssetId({ protocol: 'sip10', id: allowlistedSip10 })],
            },
          }),
        }
      );
      expect(
        await fungibleAssetVisibilityService.getDefaultAssetVisibility({
          protocol: 'sip10',
          id: allowlistedSip10,
        })
      ).toEqual(true);
      expect(
        await fungibleAssetVisibilityService.getDefaultAssetVisibility({
          protocol: 'sip10',
          id: defaultEnabledSip10,
        })
      ).toEqual(false);
      expect(
        await fungibleAssetVisibilityService.getDefaultAssetVisibility({
          protocol: 'sip10',
          id: pricedSip10,
        })
      ).toEqual(false);
    });
  });

  describe('isAssetVisibleById', () => {
    it('should override default visibility with user settings', async () => {
      const defaultEnabledSip10 = 'DEFAULT_SIP10';
      const pricedSip10 = 'PRICED_SIP10';
      const unpricedSip10 = 'UNPRICED_SIP10';

      const fungibleAssetVisibilityService = new FungibleAssetVisibilityService(
        createMock<AppConfigService>({
          getDefaultEnabledAssets: vi
            .fn()
            .mockResolvedValue([serializeAssetId({ protocol: 'sip10', id: defaultEnabledSip10 })]),
        }),
        createMock<LeatherApiClient>({
          fetchSip10PriceMap: vi.fn().mockResolvedValue({ [pricedSip10]: 1 }),
        }),
        {
          getSettings: vi.fn().mockReturnValue({
            assetVisibility: {
              [`${FungibleCryptoAssetProtocols.sip10}|${defaultEnabledSip10}`]: false,
              [`${FungibleCryptoAssetProtocols.sip10}|${pricedSip10}`]: false,
              [`${FungibleCryptoAssetProtocols.sip10}|${unpricedSip10}`]: true,
            },
          }),
        }
      );
      expect(
        await fungibleAssetVisibilityService.isAssetVisibleById({
          protocol: 'sip10',
          id: defaultEnabledSip10,
        })
      ).toEqual(false);
      expect(
        await fungibleAssetVisibilityService.isAssetVisibleById({
          protocol: 'sip10',
          id: pricedSip10,
        })
      ).toEqual(false);
      expect(
        await fungibleAssetVisibilityService.isAssetVisibleById({
          protocol: 'sip10',
          id: unpricedSip10,
        })
      ).toEqual(true);
    });
  });

  describe('isSwapAssetVisibleById', () => {
    it('should ignore an allowlist policy but keep user settings', async () => {
      const pricedSip10 = 'PRICED_SIP10';
      const hiddenPricedSip10 = 'HIDDEN_PRICED_SIP10';
      const unpricedSip10 = 'UNPRICED_SIP10';

      const price = { price: 1, lastPriceAt: '2026-10-23T00:00:00Z', change24h: null };
      vi.mocked(mockLeatherApiClient.fetchSip10PriceMap).mockResolvedValue({
        [pricedSip10]: price,
        [hiddenPricedSip10]: price,
      });
      const fungibleAssetVisibilityService = new FungibleAssetVisibilityService(
        mockAppConfigService,
        mockLeatherApiClient,
        {
          getSettings: vi.fn().mockReturnValue({
            assetVisibility: {
              [`${FungibleCryptoAssetProtocols.sip10}|${hiddenPricedSip10}`]: false,
            },
            defaultAssetVisibility: { type: 'allowlist', assets: [] },
          }),
        }
      );
      expect(
        await fungibleAssetVisibilityService.isSwapAssetVisibleById({
          protocol: 'sip10',
          id: pricedSip10,
        })
      ).toEqual(true);
      expect(
        await fungibleAssetVisibilityService.isSwapAssetVisibleById({
          protocol: 'sip10',
          id: hiddenPricedSip10,
        })
      ).toEqual(false);
      expect(
        await fungibleAssetVisibilityService.isSwapAssetVisibleById({
          protocol: 'sip10',
          id: unpricedSip10,
        })
      ).toEqual(false);
      expect(
        await fungibleAssetVisibilityService.isAssetVisibleById({
          protocol: 'sip10',
          id: pricedSip10,
        })
      ).toEqual(false);
    });
  });
});
