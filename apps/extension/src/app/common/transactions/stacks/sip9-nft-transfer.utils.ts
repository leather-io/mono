import {
  deserializeCV,
  postConditionToWire,
  principalCV,
  serializeCV,
  serializePostConditionWire,
} from '@stacks/transactions';

import { getStacksAssetStringParts } from '@leather.io/stacks';

import { makeNftPostCondition } from '@shared/utils/post-conditions';

interface CreateSip9NftTransferContractCallArgs {
  assetIdentifier: string;
  serializedTokenId: string;
  sender: string;
  recipient: string;
}
export function createSip9NftTransferContractCall({
  assetIdentifier,
  serializedTokenId,
  sender,
  recipient,
}: CreateSip9NftTransferContractCallArgs) {
  const { contractAddress, contractAssetName, contractName } =
    getStacksAssetStringParts(assetIdentifier);
  const postCondition = makeNftPostCondition({
    assetId: serializedTokenId,
    contractAddress,
    contractAssetName,
    contractName,
    stxAddress: sender,
  });

  return {
    contractAddress,
    contractName,
    functionName: 'transfer',
    functionArgs: [
      deserializeCV(serializedTokenId),
      principalCV(sender),
      principalCV(recipient),
    ].map(arg => serializeCV(arg)),
    postConditions: [serializePostConditionWire(postConditionToWire(postCondition))],
  };
}
