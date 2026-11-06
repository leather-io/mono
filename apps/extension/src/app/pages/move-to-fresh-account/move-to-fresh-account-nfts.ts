import { bytesToUtf8, hexToBytes } from '@stacks/common';
import { type StacksNetwork } from '@stacks/network';
import {
  ClarityType,
  type ClarityValue,
  fetchContractMapEntry,
  hexToCV,
  uintCV,
} from '@stacks/transactions';

import { bnsContractName } from '@leather.io/models';
import { getHiroStacksApiClient } from '@leather.io/services';
import { formatContractIdString, getStacksAssetStringParts } from '@leather.io/stacks';

import { hiroFetchWrapper } from '@app/query/stacks/stacks-client';

const bnsMarketMapName = 'market';

interface NftDescription {
  label: string;
  blockedReason: string | null;
}

export function getNftDisplayName(assetIdentifier: string, tokenIdRepr: string) {
  const { contractAssetName } = getStacksAssetStringParts(assetIdentifier);
  return `${contractAssetName} #${tokenIdRepr.replace(/^u/, '')}`;
}

function getUintTokenId(tokenIdHex: string) {
  const cv = hexToCV(tokenIdHex);
  return cv.type === ClarityType.UInt ? BigInt(cv.value) : null;
}

function decodeBufferCV(cv: ClarityValue | undefined) {
  return cv?.type === ClarityType.Buffer ? bytesToUtf8(hexToBytes(cv.value)) : null;
}

function isManagerTransferable(namespacePropertiesCV: ClarityValue) {
  if (namespacePropertiesCV.type !== ClarityType.ResponseOk) return false;
  if (namespacePropertiesCV.value.type !== ClarityType.Tuple) return false;
  const properties = namespacePropertiesCV.value.value['properties'];
  if (properties?.type !== ClarityType.Tuple) return false;
  return properties.value['manager-transferable']?.type === ClarityType.BoolTrue;
}

interface DescribeBnsNameArgs {
  contractAddress: string;
  contractName: string;
  tokenId: bigint;
  network: StacksNetwork;
  fallbackLabel: string;
}
async function describeBnsName({
  contractAddress,
  contractName,
  tokenId,
  network,
  fallbackLabel,
}: DescribeBnsNameArgs): Promise<NftDescription> {
  const client = getHiroStacksApiClient();
  const nameCV = await client.callReadOnlyFunction(
    {
      contractAddress,
      contractName,
      functionName: 'get-bns-from-id',
      functionArgs: [uintCV(tokenId)],
    },
    { skipCache: true }
  );
  if (nameCV.type !== ClarityType.OptionalSome || nameCV.value.type !== ClarityType.Tuple)
    return { label: fallbackLabel, blockedReason: null };

  const namespaceCV = nameCV.value.value['namespace'];
  const name = decodeBufferCV(nameCV.value.value['name']);
  const namespace = decodeBufferCV(namespaceCV);
  if (!name || !namespace || !namespaceCV) return { label: fallbackLabel, blockedReason: null };
  const label = `${name}.${namespace}`;

  const [namespacePropertiesCV, listingCV] = await Promise.all([
    client.callReadOnlyFunction(
      {
        contractAddress,
        contractName,
        functionName: 'get-namespace-properties',
        functionArgs: [namespaceCV],
      },
      { skipCache: true }
    ),
    fetchContractMapEntry({
      contractAddress,
      contractName,
      mapName: bnsMarketMapName,
      mapKey: uintCV(tokenId),
      network,
      client: { fetch: hiroFetchWrapper },
    }),
  ]);

  if (listingCV.type === ClarityType.OptionalSome)
    return { label, blockedReason: 'Listed for sale. Unlist it to move it.' };
  if (isManagerTransferable(namespacePropertiesCV))
    return { label, blockedReason: 'Its namespace only allows transfers through its own app.' };
  return { label, blockedReason: null };
}

interface DescribeNftArgs {
  assetIdentifier: string;
  tokenIdHex: string;
  tokenIdRepr: string;
  network: StacksNetwork;
}
export async function describeNft({
  assetIdentifier,
  tokenIdHex,
  tokenIdRepr,
  network,
}: DescribeNftArgs): Promise<NftDescription> {
  const fallbackLabel = getNftDisplayName(assetIdentifier, tokenIdRepr);
  const tokenId = getUintTokenId(tokenIdHex);
  if (tokenId === null) return { label: fallbackLabel, blockedReason: null };

  const { contractAddress, contractName } = getStacksAssetStringParts(assetIdentifier);
  try {
    if (contractName === bnsContractName)
      return await describeBnsName({
        contractAddress,
        contractName,
        tokenId,
        network,
        fallbackLabel,
      });

    const metadata = await getHiroStacksApiClient().getNftMetadata(
      formatContractIdString({ contractAddress, contractName }),
      Number(tokenId)
    );
    return { label: metadata?.name ?? fallbackLabel, blockedReason: null };
  } catch {
    return { label: fallbackLabel, blockedReason: null };
  }
}
