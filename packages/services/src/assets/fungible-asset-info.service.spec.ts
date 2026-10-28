import { btcAsset } from '@leather.io/constants';
import {
  CryptoAssetProtocols,
  type FungibleCryptoAsset,
  type Sip10Asset,
} from '@leather.io/models';

import { type LeatherApiClient } from '../infrastructure/api/leather/leather-api.client';
import { createMock } from '../test/create-mock';
import { FungibleAssetInfoService } from './fungible-asset-info.service';

describe(FungibleAssetInfoService.name, () => {
  const nativeTokenDescription = 'nativeTokenDescription';
  const sip10TokenDescription = 'sip10TokenDescription';

  const fetchNativeTokenDescription = vi.fn().mockResolvedValue({
    description: nativeTokenDescription,
  });
  const fetchSip10TokenDescription = vi.fn().mockResolvedValue({
    description: sip10TokenDescription,
  });
  const mockLeatherApiClient = createMock<LeatherApiClient>({
    fetchNativeTokenDescription,
    fetchSip10TokenDescription,
  });

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
      const sip10Asset: Sip10Asset = {
        chain: 'stacks',
        category: 'fungible',
        protocol: CryptoAssetProtocols.sip10,
        canTransfer: true,
        assetId: 'contractId::token',
        contractId,
        decimals: 6,
        hasMemo: true,
        imageCanonicalUri: '',
        name: 'TestToken',
        symbol: 'TT',
      };

      const signal = new AbortController().signal;
      const description = await fungibleAssetInfoService.getAssetDescription(
        sip10Asset,
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
      const asset: FungibleCryptoAsset = { ...btcAsset };
      Reflect.set(asset, 'protocol', 'unsupported');
      await expect(
        fungibleAssetInfoService.getAssetDescription(asset, 'en', signal)
      ).rejects.toThrow();
    });
  });
});
