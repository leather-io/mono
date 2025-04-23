import { PostCondition, deserializeCV } from '@stacks/transactions';

import { formatAssetString } from '@leather.io/stacks';

interface NftPostConditionsOptions {
  assetId: string;
  contractAddress: string;
  contractAssetName: string;
  contractName: string;
  stxAddress: string;
}
export function makeNftPostCondition(options: NftPostConditionsOptions): PostCondition {
  const { assetId, contractAddress, contractAssetName, contractName, stxAddress } = options;

  return {
    type: 'nft-postcondition',
    address: stxAddress,
    condition: 'sent',
    asset: formatAssetString({ contractAddress, contractName, assetName: contractAssetName }),
    assetId: deserializeCV(assetId),
  };
}
