import { Cl, type ClarityValue } from '@stacks/transactions';

import { WalletDefaultNetworkConfigurationIds, defaultNetworksKeyedById } from '@leather.io/models';

import { type BnsV2ApiClient } from '../infrastructure/api/bns-v2/bns-v2-api.client';
import { type HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import { type SettingsService } from '../infrastructure/settings/settings.service';
import { createMock } from '../test/create-mock';
import { BnsService } from './bns.service';

const tokenId = 42;
const bnsFromIdResponse = Cl.some(
  Cl.tuple({ name: Cl.bufferFromAscii('leather'), namespace: Cl.bufferFromAscii('btc') })
);

function createNamespacePropertiesResponse(managerTransferable: boolean) {
  return Cl.ok(
    Cl.tuple({
      namespace: Cl.bufferFromAscii('btc'),
      properties: Cl.tuple({ 'manager-transferable': Cl.bool(managerTransferable) }),
    })
  );
}

interface CreateServiceArgs {
  managerTransferable: boolean;
  marketEntry: ClarityValue;
}
function createService({ managerTransferable, marketEntry }: CreateServiceArgs) {
  const callReadOnlyFunction = vi.fn(({ functionName }: { functionName: string }) =>
    Promise.resolve(
      functionName === 'get-bns-from-id'
        ? bnsFromIdResponse
        : createNamespacePropertiesResponse(managerTransferable)
    )
  );
  const getMapEntry = vi.fn().mockResolvedValue(marketEntry);
  const settings: SettingsService = {
    getSettings: () => ({
      network: defaultNetworksKeyedById[WalletDefaultNetworkConfigurationIds.mainnet],
      quoteCurrency: 'USD',
      assetVisibility: {},
    }),
  };
  const service = new BnsService(
    createMock<BnsV2ApiClient>({}),
    createMock<HiroStacksApiClient>({ callReadOnlyFunction, getMapEntry }),
    settings
  );
  return { service, callReadOnlyFunction, getMapEntry };
}

describe(BnsService.name, () => {
  describe('getBnsNameTransferBlocker', () => {
    it('should return null for an unlisted name in an unmanaged namespace', async () => {
      const { service } = createService({ managerTransferable: false, marketEntry: Cl.none() });
      expect(await service.getBnsNameTransferBlocker(tokenId)).toBeNull();
    });

    it('should return managed-namespace when the namespace manager controls transfers', async () => {
      const { service } = createService({ managerTransferable: true, marketEntry: Cl.none() });
      expect(await service.getBnsNameTransferBlocker(tokenId)).toEqual('managed-namespace');
    });

    it('should return listed when the name is listed in the market', async () => {
      const { service } = createService({
        managerTransferable: false,
        marketEntry: Cl.some(
          Cl.tuple({
            price: Cl.uint(100),
            commission: Cl.principal('SP000000000000000000002Q6VF78'),
          })
        ),
      });
      expect(await service.getBnsNameTransferBlocker(tokenId)).toEqual('listed');
    });

    it('should query the BNS-V2 contract for the token id and its namespace', async () => {
      const { service, callReadOnlyFunction, getMapEntry } = createService({
        managerTransferable: false,
        marketEntry: Cl.none(),
      });
      await service.getBnsNameTransferBlocker(tokenId);

      const contract = {
        contractAddress: 'SP2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D96YPGZF',
        contractName: 'BNS-V2',
      };
      expect(getMapEntry).toHaveBeenCalledWith(
        { ...contract, mapName: 'market', key: Cl.uint(tokenId) },
        expect.objectContaining({ skipCache: true })
      );
      expect(callReadOnlyFunction).toHaveBeenCalledWith(
        {
          ...contract,
          functionName: 'get-namespace-properties',
          functionArgs: [Cl.bufferFromAscii('btc')],
        },
        expect.objectContaining({ skipCache: true })
      );
    });
  });
});
