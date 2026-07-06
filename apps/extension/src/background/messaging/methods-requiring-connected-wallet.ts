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

// Message-signing methods rejected while a multisig policy account is active: a
// multisig cannot produce a single-signer message signature. Transaction methods
// are NOT listed here — they gate per-handler: `sendTransfer` and
// `stx_callContract` propose to the coordinator and `stx_signTransaction`
// co-signs (each via `validateActivePolicyChain`), the remaining STX tx methods
// reject via `validateNoActivePolicy`, and `signPsbt`'s wsh-descriptor path is
// the legitimate co-signing flow.
export const methodsUnsupportedWithActivePolicy = new Set<RpcRequests['method']>([
  signMessage.method,
  stxSignMessage.method,
  stxSignStructuredMessage.method,
]);
