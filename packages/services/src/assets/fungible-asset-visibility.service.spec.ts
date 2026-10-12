import { FungibleCryptoAssetProtocols } from '@leather.io/models';
import { serializeAssetId } from '@leather.io/utils';

import { LeatherApiClient } from '../infrastructure/api/leather/leather-api.client';
import { AppConfigService } from '../infrastructure/app-config/app-config.service';
import { SettingsService } from '../infrastructure/settings/settings.service';
import { FungibleAssetVisibilityService } from './fungible-asset-visibility.service';

describe(FungibleAssetVisibilityService.name, () => {
  const mockAppConfigService = {
    getDefaultEnabledAssets: vi.fn().mockResolvedValue([]),
  } as unknown as AppConfigService;

  const mockLeatherApiClient = {
    fetchSip10PriceMap: vi.fn().mockResolvedValue({}),
  } as unknown as LeatherApiClient;

  const mockSettingsService = {
    getSettings: vi.fn().mockReturnValue({}),
  } as unknown as SettingsService;

  describe('getDefaultAssetVisibility', () => {
    it('should influence visibility based on default enabled assets', async () => {
      const defaultEnabledSip10 = 'DEFAULT_SIP10';

      const fungibleAssetVisibilityService = new FungibleAssetVisibilityService(
        {
          getDefaultEnabledAssets: vi
            .fn()
            .mockResolvedValue([serializeAssetId({ protocol: 'sip10', id: defaultEnabledSip10 })]),
        } as unknown as AppConfigService,
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
        {
          fetchSip10PriceMap: vi.fn().mockResolvedValue({ [pricedSip10]: 1 }),
        } as unknown as LeatherApiClient,
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
  });

  describe('isAssetVisibleById', () => {
    it('should override default visibility with user settings', async () => {
      const defaultEnabledSip10 = 'DEFAULT_SIP10';
      const pricedSip10 = 'PRICED_SIP10';
      const unpricedSip10 = 'UNPRICED_SIP10';

      const fungibleAssetVisibilityService = new FungibleAssetVisibilityService(
        {
          getDefaultEnabledAssets: vi
            .fn()
            .mockResolvedValue([serializeAssetId({ protocol: 'sip10', id: defaultEnabledSip10 })]),
        } as unknown as AppConfigService,
        {
          fetchSip10PriceMap: vi.fn().mockResolvedValue({ [pricedSip10]: 1 }),
        } as unknown as LeatherApiClient,
        {
          getSettings: vi.fn().mockReturnValue({
            assetVisibility: {
              [`${FungibleCryptoAssetProtocols.sip10}|${defaultEnabledSip10}`]: false,
              [`${FungibleCryptoAssetProtocols.sip10}|${pricedSip10}`]: false,
              [`${FungibleCryptoAssetProtocols.sip10}|${unpricedSip10}`]: true,
            },
          }),
        } as unknown as SettingsService
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
});
