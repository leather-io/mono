import { ClarityType, type ClarityValue, cvToString, getCVTypeString } from '@stacks/transactions';

import {
  type BnsName,
  type BnsProfileData,
  type BnsProfileDataAddresses,
} from '@leather.io/models';

import {
  type BnsV2ApiAddressName,
  type BnsV2ApiName,
  type BnsV2ApiNameResponse,
  type BnsV2ApiZoneFile,
  type BnsV2ApiZoneFileAddress,
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
    renewalHeight: Number(bnsV2ApiName.renewal_height),
    registeredAtBlockNumber: Number(bnsV2ApiName.registered_at),
  };
}

export function mapBnsNameFromV2ApiAddressName(bnsV2ApiAddressName: BnsV2ApiAddressName): BnsName {
  return {
    owner: bnsV2ApiAddressName.owner,
    name: bnsV2ApiAddressName.name_string,
    namespace: bnsV2ApiAddressName.namespace_string,
    fullName: bnsV2ApiAddressName.full_name,
    renewalHeight: Number(bnsV2ApiAddressName.renewal_height),
    registeredAtBlockNumber: Number(bnsV2ApiAddressName.registered_at),
  };
}

export function buildBnsName(owner: string, name: string, namespace: string): BnsName {
  return {
    owner,
    name,
    namespace,
    fullName: `${name}.${namespace}`,
    renewalHeight: 0,
    registeredAtBlockNumber: 0,
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
    ethereum: zoneFileAddresses.find(
      address => address.network === 'eth' && address.type === 'wallet'
    )?.address,
    solana: zoneFileAddresses.find(
      address => address.network === 'sol' && address.type === 'wallet'
    )?.address,
  };
}

function decodeBnsBufferCV(cv: ClarityValue | undefined) {
  if (cv?.type !== ClarityType.Buffer) {
    throw new Error('Unexpected BNS primary name response structure');
  }
  return Buffer.from(cv.value, 'hex').toString();
}

export function parseBnsContractGetPrimaryResponseCV(
  res: ClarityValue
): { name: string; namespace: string } | null {
  if (res.type === ClarityType.ResponseOk) {
    if (res.value.type === ClarityType.Tuple) {
      return {
        name: decodeBnsBufferCV(res.value.value['name']),
        namespace: decodeBnsBufferCV(res.value.value['namespace']),
      };
    } else if (res.value.type === ClarityType.OptionalSome) {
      const innerValue = res.value.value;
      if (innerValue.type === ClarityType.Tuple) {
        return {
          name: decodeBnsBufferCV(innerValue.value['name']),
          namespace: decodeBnsBufferCV(innerValue.value['namespace']),
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
