import { btcAsset } from '@leather.io/constants';
import { CryptoAssetProtocols, FungibleCryptoAsset, Sip10Asset } from '@leather.io/models';

import { LeatherApiClient } from '../infrastructure/api/leather/leather-api.client';
import { FungibleAssetInfoService } from './fungible-asset-info.service';

describe(FungibleAssetInfoService.name, () => {
  const nativeTokenDescription = 'nativeTokenDescription';
  const sip10TokenDescription = 'sip10TokenDescription';

  const mockLeatherApiClient = {
    fetchNativeTokenDescription: vi.fn().mockResolvedValue({
      description: nativeTokenDescription,
    }),
    fetchSip10TokenDescription: vi.fn().mockResolvedValue({
      description: sip10TokenDescription,
    }),
  } as unknown as LeatherApiClient;

  const fungibleAssetInfoService = new FungibleAssetInfoService(mockLeatherApiClient);

  describe('getAssetDescription', () => {
    it('should return native asset descriptions from Leather API', async () => {
      const signal = new AbortController().signal;
      const description = await fungibleAssetInfoService.getAssetDescription(
        btcAsset,
        'en',
        signal
      );

      expect(mockLeatherApiClient.fetchNativeTokenDescription).toHaveBeenCalledWith(
        btcAsset.symbol,
        'en',
        { signal }
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
        'en',
        signal
      );

      expect(mockLeatherApiClient.fetchSip10TokenDescription).toHaveBeenCalledWith(
        contractId,
        'en',
        { signal }
      );
      expect(description).toEqual({
        description: sip10TokenDescription,
      });
    });

    it('should throw an error if the asset protocol is not supported', async () => {
      const signal = new AbortController().signal;
      const asset = { protocol: 'unsupported' } as unknown as FungibleCryptoAsset;
      await expect(
        fungibleAssetInfoService.getAssetDescription(asset, 'en', signal)
      ).rejects.toThrow();
    });
  });
});
