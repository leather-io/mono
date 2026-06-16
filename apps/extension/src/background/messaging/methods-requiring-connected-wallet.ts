import {
  type RpcRequests,
  sendTransfer,
  signMessage,
  signPsbt,
  stxCallContract,
  stxDeployContract,
  stxSignMessage,
  stxSignStructuredMessage,
  stxSignTransaction,
  stxTransferSip9Nft,
  stxTransferSip10Ft,
  stxTransferStx,
} from '@leather.io/rpc';

export const methodsRequiringConnectedWallet = new Set<RpcRequests['method']>([
  signPsbt.method,
  signMessage.method,
  sendTransfer.method,
  stxSignMessage.method,
  stxSignStructuredMessage.method,
  stxSignTransaction.method,
  stxCallContract.method,
  stxDeployContract.method,
  stxTransferStx.method,
  stxTransferSip9Nft.method,
  stxTransferSip10Ft.method,
]);
