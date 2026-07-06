import {
  AddressHashMode,
  type MultiSigSpendingCondition,
  type SpendingCondition,
  type StacksTransactionWire,
  createMultiSigSpendingCondition,
  deserializeTransaction,
} from '@stacks/transactions';

import { type RpcParams, createRequestEncoder, stxSignTransaction } from '@leather.io/rpc';
import { deriveStxMultisigAddress } from '@leather.io/stacks';

import { initialSearchParams } from '@app/common/initial-search-params';
import { getTxSenderAddress } from '@app/common/transactions/stacks/transaction.utils';
import type { PolicyStore } from '@app/store/policy/policy-store.utils';

function getStacksTransactionHexFromRequest(requestParams: RpcParams<typeof stxSignTransaction>) {
  if ('txHex' in requestParams) return requestParams.txHex;
  return requestParams.transaction;
}

function getDecodedRpcStxSignTransactionRequest() {
  const { decode } = createRequestEncoder(stxSignTransaction.request);
  const rpcRequest = initialSearchParams.get('rpcRequest');
  if (!rpcRequest) throw new Error('Missing rpcRequest');
  return decode(rpcRequest);
}

export function getUnsignedStacksTransactionFromRpcRequest() {
  const decodedRpcRequest = getDecodedRpcStxSignTransactionRequest();
  return deserializeTransaction(getStacksTransactionHexFromRequest(decodedRpcRequest.params));
}

export function checkUnsignedStacksTransactionHashMode(tx: StacksTransactionWire) {
  return isMultisigHashMode(tx.auth.spendingCondition.hashMode);
}

function isMultisigHashMode(hashMode: AddressHashMode) {
  return (
    hashMode === AddressHashMode.P2SH ||
    hashMode === AddressHashMode.P2WSH ||
    hashMode === AddressHashMode.P2SHNonSequential ||
    hashMode === AddressHashMode.P2WSHNonSequential
  );
}

function isMultisigSpendingCondition(
  spendingCondition: SpendingCondition
): spendingCondition is MultiSigSpendingCondition {
  return isMultisigHashMode(spendingCondition.hashMode);
}

function getTxSenderAddressOrNull(tx: StacksTransactionWire) {
  try {
    return getTxSenderAddress(tx) ?? null;
  } catch {
    return null;
  }
}

interface IsUnsignedStacksTransactionForPolicyArgs {
  tx: StacksTransactionWire;
  policy: PolicyStore;
  signerPublicKey: string;
  chainId: number;
  networkId: string;
}

export function isUnsignedStacksTransactionForPolicy({
  tx,
  policy,
  signerPublicKey,
  chainId,
  networkId,
}: IsUnsignedStacksTransactionForPolicyArgs) {
  if (policy.chain !== 'stacks') return false;
  if (policy.networkId !== networkId) return false;
  if (tx.chainId !== chainId) return false;
  if (!policy.publicKeys.includes(signerPublicKey)) return false;

  const spendingCondition = tx.auth.spendingCondition;
  if (!isMultisigSpendingCondition(spendingCondition)) return false;
  if (spendingCondition.signaturesRequired !== policy.threshold) return false;

  const policyAddress = deriveStxMultisigAddress({
    publicKeys: policy.publicKeys,
    threshold: policy.threshold,
    chainId,
  });
  if (policyAddress !== policy.address) return false;

  const signer = createMultiSigSpendingCondition(
    spendingCondition.hashMode,
    policy.threshold,
    policy.publicKeys,
    0,
    0
  ).signer;

  return spendingCondition.signer === signer && getTxSenderAddressOrNull(tx) === policy.address;
}
