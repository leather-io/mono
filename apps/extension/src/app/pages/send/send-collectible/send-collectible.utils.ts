import type { StacksNetwork } from '@stacks/network';
import { PostConditionMode, serializeCV, uintCV } from '@stacks/transactions';

import type { Money, Sip9Asset } from '@leather.io/models';
import type { CollectibleTransferBlocker } from '@leather.io/services';
import { type StacksUnsignedContractCallOptions, TransactionTypes } from '@leather.io/stacks';
import { assertUnreachable } from '@leather.io/utils';

import { createSip9NftTransferContractCall } from '@app/common/transactions/stacks/sip9-nft-transfer.utils';

interface CreateCollectibleTransferTxOptionsArgs {
  asset: Sip9Asset;
  sender: string;
  publicKey: string;
  recipient: string;
  fee: Money;
  nonce: number | string;
  network: StacksNetwork;
}
export function createCollectibleTransferTxOptions({
  asset,
  sender,
  publicKey,
  recipient,
  fee,
  nonce,
  network,
}: CreateCollectibleTransferTxOptionsArgs): StacksUnsignedContractCallOptions {
  return {
    txType: TransactionTypes.ContractCall,
    ...createSip9NftTransferContractCall({
      assetIdentifier: asset.assetId,
      serializedTokenId: serializeCV(uintCV(asset.tokenId)),
      sender,
      recipient,
    }),
    postConditionMode: PostConditionMode.Deny,
    publicKey,
    fee,
    nonce,
    network,
  };
}

export function getCollectibleTransferBlockerMessage(blocker: CollectibleTransferBlocker) {
  switch (blocker) {
    case 'unsupported-contract':
      return 'The contract of this collectible has no standard SIP-009 transfer function, so Leather cannot send it.';
    case 'managed-namespace':
      return 'The manager of this namespace controls transfers. Use the namespace manager to send this name.';
    case 'listed':
      return 'This name is listed for sale. Remove the listing before you send it.';
    default:
      return assertUnreachable(blocker);
  }
}
