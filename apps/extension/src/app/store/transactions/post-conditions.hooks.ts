import { FungiblePostConditionWire, addressToString } from '@stacks/transactions';

import { useGetSip10AssetByPrincipalQuery } from '@app/query/stacks/sip10/sip10-asset.query';

export function useAssetFromFungiblePostCondition(pc: FungiblePostConditionWire) {
  const contractAddress = addressToString(pc.asset.address);
  const contractName = pc.asset.contractName.content;
  const contractId = `${contractAddress}.${contractName}`;
  const { data: asset } = useGetSip10AssetByPrincipalQuery(contractId);

  return asset;
}
