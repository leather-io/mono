import type { StacksNetwork } from '@stacks/network';

import type { Money } from '@leather.io/models';
import { createRequestEncoder, stxTransferSip9Nft } from '@leather.io/rpc';
import { type StacksUnsignedContractCallOptions, TransactionTypes } from '@leather.io/stacks';
import { createMoney } from '@leather.io/utils';

import { initialSearchParams } from '@app/common/initial-search-params';
import { createSip9NftTransferContractCall } from '@app/common/transactions/stacks/sip9-nft-transfer.utils';
import type { Nonce } from '@app/features/nonce-editor/nonce-editor.context';

export function getDecodedRpcStxTransferSip9NftRequest() {
  const { decode } = createRequestEncoder(stxTransferSip9Nft.request);
  const rpcRequest = initialSearchParams.get('rpcRequest');
  if (!rpcRequest) throw new Error('Missing rpcRequest');
  return decode(rpcRequest);
}

function getTransactionOptionsFromRpcRequest(address: string) {
  const { params } = getDecodedRpcStxTransferSip9NftRequest();

  return {
    ...createSip9NftTransferContractCall({
      assetIdentifier: params.asset,
      serializedTokenId: params.assetId,
      sender: params.address ?? address,
      recipient: params.recipient,
    }),
    fee: params.fee ? createMoney(params.fee, 'STX') : undefined,
    nonce: params.nonce,
    sponsored: params.sponsored,
  };
}

interface GetUnsignedStacksContractCallOptionsForFeeEstimationArgs {
  address: string;
  publicKey: string;
  network: StacksNetwork;
}
export function getUnsignedStacksContractCallOptionsForFeeEstimation({
  address,
  publicKey,
  network,
}: GetUnsignedStacksContractCallOptionsForFeeEstimationArgs): StacksUnsignedContractCallOptions {
  const requestOptions = getTransactionOptionsFromRpcRequest(address);

  return {
    txType: TransactionTypes.ContractCall,
    ...requestOptions,
    fee: requestOptions.fee ?? createMoney(0, 'STX'),
    nonce: requestOptions.nonce ?? 0,
    publicKey,
    network,
  };
}

interface GetUnsignedStacksContractCallOptionsArgs {
  address: string;
  fee: Money;
  network: StacksNetwork;
  nonce: Nonce;
  publicKey: string;
}
export function getUnsignedStacksContractCallOptions({
  address,
  fee,
  network,
  nonce,
  publicKey,
}: GetUnsignedStacksContractCallOptionsArgs): StacksUnsignedContractCallOptions {
  const requestOptions = getTransactionOptionsFromRpcRequest(address);

  return {
    txType: TransactionTypes.ContractCall,
    ...requestOptions,
    publicKey,
    network,
    fee,
    nonce,
  };
}
