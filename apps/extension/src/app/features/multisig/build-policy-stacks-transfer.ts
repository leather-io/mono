import type { StacksNetwork } from '@stacks/network';
import {
  Pc,
  PostConditionMode,
  type StacksTransactionWire,
  serializeCV,
} from '@stacks/transactions';

import type { Money } from '@leather.io/models';
import {
  TransactionTypes,
  createSip10FnArgs,
  formatContractIdString,
  generateStacksUnsignedTransaction,
  getStacksAssetStringParts,
} from '@leather.io/stacks';
import { createMoney } from '@leather.io/utils';

import type { PolicyStore } from '@app/store/policy/policy-store.utils';

// Proposals commit to a canonical nonce 0; the coordinator assigns the real
// nonce when promoting the proposal to pending before broadcast.
const placeholderNonce = 0;

type StacksPolicy = Extract<PolicyStore, { chain: 'stacks' }>;

interface BuildUnsignedPolicyStxTransferArgs {
  policy: StacksPolicy;
  network: StacksNetwork;
  recipient: string;
  amount: Money;
  fee?: Money;
  memo?: string;
}

export async function buildUnsignedPolicyStxTransfer({
  policy,
  network,
  recipient,
  amount,
  fee = createMoney(0, 'STX'),
  memo,
}: BuildUnsignedPolicyStxTransferArgs): Promise<StacksTransactionWire> {
  return generateStacksUnsignedTransaction({
    txType: TransactionTypes.StxTokenTransfer,
    recipient,
    amount,
    fee,
    memo,
    network,
    publicKeys: policy.publicKeys,
    numSignatures: policy.threshold,
    useNonSequentialMultiSig: true,
    nonce: placeholderNonce,
  });
}

interface BuildUnsignedPolicySip10TransferArgs {
  policy: StacksPolicy;
  network: StacksNetwork;
  assetId: string;
  recipient: string;
  baseUnitAmount: string;
  fee?: Money;
  memo?: string;
}

export async function buildUnsignedPolicySip10Transfer({
  policy,
  network,
  assetId,
  recipient,
  baseUnitAmount,
  fee = createMoney(0, 'STX'),
  memo,
}: BuildUnsignedPolicySip10TransferArgs): Promise<StacksTransactionWire> {
  const { contractAddress, contractAssetName, contractName } = getStacksAssetStringParts(assetId);

  const functionArgs = createSip10FnArgs({
    amount: baseUnitAmount,
    senderStacksAddress: policy.address,
    recipientStacksAddress: recipient,
    memo,
  });

  return generateStacksUnsignedTransaction({
    txType: TransactionTypes.ContractCall,
    contractAddress,
    contractName,
    functionName: 'transfer',
    functionArgs: functionArgs.map(arg => serializeCV(arg)),
    postConditions: [
      Pc.principal(policy.address)
        .willSendEq(baseUnitAmount)
        .ft(formatContractIdString({ contractAddress, contractName }), contractAssetName),
    ],
    postConditionMode: PostConditionMode.Deny,
    fee,
    nonce: placeholderNonce,
    network,
    publicKeys: policy.publicKeys,
    numSignatures: policy.threshold,
    useNonSequentialMultiSig: true,
  });
}
