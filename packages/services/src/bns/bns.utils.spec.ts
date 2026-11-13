import { Cl } from '@stacks/transactions';

import {
  type BnsV2ApiZoneFilResponse,
  type BnsV2ApiZoneFileAddress,
} from '../infrastructure/api/bns-v2/bns-v2-api.schema';
import {
  getBnsNamespaceCVFromGetBnsFromIdResponseCV,
  isManagerTransferableNamespaceResponseCV,
  mapBnsProfileDataAddresses,
  mapBnsProfileDataFromZoneFile,
} from './bns.utils';

describe(mapBnsProfileDataAddresses.name, () => {
  const oldSchemaBtcAddress = '3123123123123123123123123123123123123123';
  const nativeSegwitBtcAddress = 'bc1q1234567890123456789012345678901234567890';
  const ethAddress = '0x1234567890123456789012345678901234567890';
  const solAddress = 'So11111111111111111111111111111111111111112';

  it('should build profile btc, eth, and sol addresses from the zone file', () => {
    const zoneFileAddresses: BnsV2ApiZoneFileAddress[] = [
      {
        network: 'btc',
        type: 'payment',
        address: nativeSegwitBtcAddress,
      },
      {
        network: 'eth',
        type: 'wallet',
        address: ethAddress,
      },
      {
        network: 'sol',
        type: 'wallet',
        address: solAddress,
      },
    ];
    expect(mapBnsProfileDataAddresses(oldSchemaBtcAddress, zoneFileAddresses)).toEqual({
      bitcoinPayment: nativeSegwitBtcAddress,
      ethereum: ethAddress,
      solana: solAddress,
    });
  });

  it('should use the old schema btc address as payment address if no new payment address in zone file', () => {
    expect(mapBnsProfileDataAddresses(oldSchemaBtcAddress, [])).toEqual({
      bitcoinPayment: oldSchemaBtcAddress,
    });
  });

  it('should return an empty object if no addresses are provided', () => {
    expect(mapBnsProfileDataAddresses(undefined, [])).toEqual({});
  });
});

describe(mapBnsProfileDataFromZoneFile.name, () => {
  const name = 'name';
  const bio = 'bio';
  const website = 'website';
  const pfp = 'pfp';
  const location = 'location';
  const btc = 'btc';

  const zoneFileRaw: BnsV2ApiZoneFilResponse = {
    full_name: 'full_name',
    zonefile: {
      bio,
      website,
      pfp,
      name,
      location,
      addresses: [],
      btc,
    },
  };

  it('should map bns profile data from a raw zone file response', () => {
    expect(mapBnsProfileDataFromZoneFile(zoneFileRaw.zonefile)).toEqual({
      bio,
      website,
      pfpUrl: pfp,
      name,
      location,
      addresses: {
        bitcoinPayment: btc,
      },
    });
  });

  it('should remove undefined values from the profile data', () => {
    expect(mapBnsProfileDataFromZoneFile({ bio })).toEqual({
      bio,
    });
  });
});

describe(getBnsNamespaceCVFromGetBnsFromIdResponseCV.name, () => {
  it('should return the namespace buffer of a known token id', () => {
    const res = Cl.some(
      Cl.tuple({ name: Cl.bufferFromAscii('leather'), namespace: Cl.bufferFromAscii('btc') })
    );
    expect(getBnsNamespaceCVFromGetBnsFromIdResponseCV(res)).toEqual(Cl.bufferFromAscii('btc'));
  });

  it('should throw for an unknown token id', () => {
    expect(() => getBnsNamespaceCVFromGetBnsFromIdResponseCV(Cl.none())).toThrow();
  });
});

describe(isManagerTransferableNamespaceResponseCV.name, () => {
  function createNamespacePropertiesResponse(managerTransferable: boolean) {
    return Cl.ok(
      Cl.tuple({
        namespace: Cl.bufferFromAscii('btc'),
        properties: Cl.tuple({ 'manager-transferable': Cl.bool(managerTransferable) }),
      })
    );
  }

  it('should return true for a manager-transferable namespace', () => {
    expect(isManagerTransferableNamespaceResponseCV(createNamespacePropertiesResponse(true))).toBe(
      true
    );
  });

  it('should return false for a namespace without manager transfers', () => {
    expect(isManagerTransferableNamespaceResponseCV(createNamespacePropertiesResponse(false))).toBe(
      false
    );
  });

  it('should throw for an unknown namespace', () => {
    expect(() => isManagerTransferableNamespaceResponseCV(Cl.error(Cl.uint(113)))).toThrow();
  });
});
