import {
  AuthType,
  ClarityType,
  type ClarityValue,
  type ContractCallPayload,
  Pc,
  type StacksTransactionWire,
  addressToString,
  bufferCVFromString,
  listCV,
  noneCV,
  principalCV,
  someCV,
  tupleCV,
  uintCV,
} from '@stacks/transactions';

import { formatContractIdString } from '../stacks.utils';
import {
  getMemoString,
  getVerifiedSingleFungiblePostCondition,
} from './sip-10-contract-call.utils';

export const sbtcTransferManyFunctionName = 'transfer-many';
export const sbtcTokenContractName = 'sbtc-token';
export const sbtcTokenAssetName = 'sbtc-token';

const sbtcTransferManyEntryCount = 2;

export interface SbtcSponsoredTransferParams {
  contractAddress: string;
  contractName: string;
  sender: string;
  recipient: string;
  feeRecipient: string;
  amount: bigint;
  feeAmount: bigint;
  memo?: string;
}

interface SbtcTransferEntry {
  amount: bigint;
  sender: string;
  to: string;
  memo?: string;
}

function buildTransferEntry({ amount, sender, to, memo }: SbtcTransferEntry) {
  return tupleCV({
    amount: uintCV(amount),
    sender: principalCV(sender),
    to: principalCV(to),
    memo: memo ? someCV(bufferCVFromString(memo)) : noneCV(),
  });
}

export function buildSbtcTransferManyArgs({
  amount,
  feeAmount,
  sender,
  recipient,
  feeRecipient,
  memo,
}: SbtcSponsoredTransferParams): ClarityValue[] {
  return [
    listCV([
      buildTransferEntry({ amount, sender, to: recipient, memo }),
      buildTransferEntry({ amount: feeAmount, sender, to: feeRecipient }),
    ]),
  ];
}

export function buildSbtcSponsoredTransferPostCondition({
  contractAddress,
  contractName,
  sender,
  amount,
  feeAmount,
}: SbtcSponsoredTransferParams) {
  return Pc.principal(sender)
    .willSendEq(amount + feeAmount)
    .ft(formatContractIdString({ contractAddress, contractName }), sbtcTokenAssetName);
}

export interface SbtcSponsoredTransferDetails {
  contractId: string;
  amount: bigint;
  feeAmount: bigint;
  sender: string;
  recipient: string;
  feeRecipient: string;
  memo?: string;
}

export function isSbtcTransferManyContractCall(
  tx: StacksTransactionWire
): tx is StacksTransactionWire & { payload: ContractCallPayload } {
  if (!tx.payload || !('functionName' in tx.payload)) return false;
  return (
    tx.payload.functionName.content === sbtcTransferManyFunctionName &&
    tx.payload.contractName.content === sbtcTokenContractName
  );
}

function getTransferEntry(entry: ClarityValue): SbtcTransferEntry | null {
  if (entry.type !== ClarityType.Tuple) return null;
  const { amount, sender, to, memo } = entry.value;
  if (!amount || amount.type !== ClarityType.UInt) return null;
  if (!sender || sender.type !== ClarityType.PrincipalStandard) return null;
  if (!to) return null;
  if (to.type !== ClarityType.PrincipalStandard && to.type !== ClarityType.PrincipalContract)
    return null;
  return {
    amount: BigInt(amount.value),
    sender: sender.value,
    to: to.value,
    memo: getMemoString(memo),
  };
}

export function getSbtcSponsoredTransferDetails(
  tx: StacksTransactionWire
): SbtcSponsoredTransferDetails | null {
  if (!isSbtcTransferManyContractCall(tx)) return null;
  if (tx.auth.authType !== AuthType.Sponsored) return null;
  if (tx.payload.functionArgs.length !== 1) return null;

  const [entriesArg] = tx.payload.functionArgs;
  if (entriesArg.type !== ClarityType.List) return null;
  if (entriesArg.value.length !== sbtcTransferManyEntryCount) return null;

  const [transferEntry, feeEntry] = entriesArg.value.map(getTransferEntry);
  if (!transferEntry || !feeEntry) return null;
  if (transferEntry.sender !== feeEntry.sender) return null;

  const postCondition = getVerifiedSingleFungiblePostCondition(tx);
  if (!postCondition) return null;
  if (postCondition.principal !== transferEntry.sender) return null;

  const contractId = formatContractIdString({
    contractAddress: addressToString(tx.payload.contractAddress),
    contractName: tx.payload.contractName.content,
  });
  if (postCondition.contractId !== contractId) return null;
  if (postCondition.amount !== transferEntry.amount + feeEntry.amount) return null;

  return {
    contractId,
    amount: transferEntry.amount,
    feeAmount: feeEntry.amount,
    sender: transferEntry.sender,
    recipient: transferEntry.to,
    feeRecipient: feeEntry.to,
    memo: transferEntry.memo,
  };
}
