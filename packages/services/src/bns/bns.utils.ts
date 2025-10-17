import {
  BufferCV,
  ClarityType,
  ClarityValue,
  cvToString,
  getCVTypeString,
} from '@stacks/transactions';

import { BnsName, BnsProfileData, BnsProfileDataAddresses } from '@leather.io/models';

import {
  BnsV2ApiAddressName,
  BnsV2ApiName,
  BnsV2ApiNameResponse,
  BnsV2ApiZoneFile,
  BnsV2ApiZoneFileAddress,
} from '../infrastructure/api/bns-v2/bns-v2-api.schema';

export function isValidBnsName(res: BnsV2ApiNameResponse): boolean {
  return res.data.is_valid && res.status === 'active';
}

export function mapBnsNameFromV2ApiName(bnsV2ApiName: BnsV2ApiName): BnsName {
  return {
    owner: bnsV2ApiName.owner,
    name: bnsV2ApiName.name_string,
    namespace: bnsV2ApiName.namespace_string,
    fullName: bnsV2ApiName.full_name,
    renewalHeight: bnsV2ApiName.renewal_height,
    registeredAt: bnsV2ApiName.registered_at,
  };
}

export function mapBnsNameFromV2ApiAddressName(bnsV2ApiAddressName: BnsV2ApiAddressName): BnsName {
  return {
    owner: bnsV2ApiAddressName.owner,
    name: bnsV2ApiAddressName.name_string,
    namespace: bnsV2ApiAddressName.namespace_string,
    fullName: bnsV2ApiAddressName.full_name,
    renewalHeight: bnsV2ApiAddressName.renewal_height,
    registeredAt: bnsV2ApiAddressName.registered_at,
  };
}

export function buildBnsName(owner: string, name: string, namespace: string): BnsName {
  return {
    owner,
    name,
    namespace,
    fullName: `${name}.${namespace}`,
    renewalHeight: '0',
    registeredAt: '0',
  };
}

export function mapBnsProfileDataFromZoneFile(zoneFile: BnsV2ApiZoneFile): BnsProfileData {
  const { bio, website, pfp, name, location, addresses, btc } = zoneFile;
  return {
    bio: bio || undefined,
    website: website || undefined,
    pfpUrl: pfp || undefined,
    name: name || undefined,
    location: location || undefined,
    addresses: !!btc || addresses?.length ? mapBnsProfileDataAddresses(btc, addresses) : undefined,
  };
}

export function mapBnsProfileDataAddresses(
  oldSchemaBtcAddress: string | undefined,
  zoneFileAddresses: BnsV2ApiZoneFileAddress[] = []
): BnsProfileDataAddresses {
  const btcPayment =
    zoneFileAddresses.find(address => address.network === 'btc' && address.type === 'payment')
      ?.address ?? oldSchemaBtcAddress;

  return {
    bitcoinPayment: btcPayment || undefined,
    bitcoinOrdinal: zoneFileAddresses.find(
      address => address.network === 'btc' && address.type === 'ordinal'
    )?.address,
    ethereum: zoneFileAddresses.find(
      address => address.network === 'eth' && address.type === 'wallet'
    )?.address,
    solana: zoneFileAddresses.find(
      address => address.network === 'sol' && address.type === 'wallet'
    )?.address,
  };
}

export function parseBnsContractGetPrimaryResponseCV(
  res: ClarityValue
): { name: string; namespace: string } | null {
  if (res.type === ClarityType.ResponseOk) {
    if (res.value.type === ClarityType.Tuple) {
      const nameCV = res.value.value['name'] as BufferCV;
      const namespaceCV = res.value.value['namespace'] as BufferCV;
      return {
        name: Buffer.from(nameCV.value, 'hex').toString(),
        namespace: Buffer.from(namespaceCV.value, 'hex').toString(),
      };
    } else if (res.value.type === ClarityType.OptionalSome) {
      const innerValue = res.value.value;
      if (innerValue.type === ClarityType.Tuple) {
        const nameCV = innerValue.value['name'] as BufferCV;
        const namespaceCV = innerValue.value['namespace'] as BufferCV;
        return {
          name: Buffer.from(nameCV.value, 'hex').toString(),
          namespace: Buffer.from(namespaceCV.value, 'hex').toString(),
        };
      }
    }
    throw new Error('Unexpected BNS primary name response structure');
  } else if (res.type === ClarityType.ResponseErr) {
    if (cvToString(res.value) === 'u131') {
      return null;
    }
    throw new Error(cvToString(res.value));
  } else {
    throw new Error(`Unexpected BNS primary name Clarity Value type: ${getCVTypeString(res)}`);
  }
}
