import { FungiblePostConditionWire, addressToString } from '@stacks/transactions';

import { isFtAsset } from '@leather.io/query';

import { useGetFungibleTokenMetadataQuery } from '@app/query/stacks/token-metadata/fungible-tokens/fungible-token-metadata.query';

export function useAssetFromFungiblePostCondition(pc: FungiblePostConditionWire) {
  const contractAddress = addressToString(pc.asset.address);
  const contractName = pc.asset.contractName.content;
  const contractId = `${contractAddress}.${contractName}`;
  const { data: asset } = useGetFungibleTokenMetadataQuery(contractId);

  return !(asset && isFtAsset(asset)) ? undefined : asset;
}
