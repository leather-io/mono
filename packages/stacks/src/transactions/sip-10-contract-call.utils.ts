import { bytesToUtf8, hexToBytes } from '@stacks/common';
import {
  ClarityAbi,
  ClarityType,
  ClarityValue,
  ContractCallPayload,
  FungibleConditionCode,
  PostConditionMode,
  PostConditionPrincipalId,
  PostConditionType,
  StacksTransactionWire,
  addressToString,
} from '@stacks/transactions';

import { cleanHex, formatContractIdString } from '../stacks.utils';

export function isSip10TransferContactCall(
  tx: StacksTransactionWire
): tx is StacksTransactionWire & { payload: ContractCallPayload } {
  if (tx.payload && 'functionName' in tx.payload) {
    if (
      tx.payload.functionName.content === 'transfer' &&
      (tx.payload.functionArgs.length === 3 || tx.payload.functionArgs.length === 4)
    ) {
      if (
        tx.payload.functionArgs[0].type === ClarityType.UInt &&
        tx.payload.functionArgs[1].type === ClarityType.PrincipalStandard &&
        tx.payload.functionArgs[2].type === ClarityType.PrincipalStandard
      ) {
        return true;
      }
    }
  }
  return false;
}

export interface Sip10TransferDetails {
  contractId: string;
  assetName: string;
  amount: bigint;
  sender: string;
  recipient: string;
  memo?: string;
}

export function getMemoString(arg: ClarityValue | undefined): string | undefined {
  if (!arg || arg.type !== ClarityType.OptionalSome) return undefined;
  if (arg.value.type !== ClarityType.Buffer) return undefined;
  return bytesToUtf8(hexToBytes(cleanHex(arg.value.value)));
}

export interface VerifiedFungiblePostCondition {
  contractId: string;
  assetName: string;
  principal: string;
  amount: bigint;
}

export function getVerifiedSingleFungiblePostCondition(
  tx: StacksTransactionWire
): VerifiedFungiblePostCondition | null {
  if (tx.postConditionMode !== PostConditionMode.Deny) return null;
  if (tx.postConditions.values.length !== 1) return null;

  const postCondition = tx.postConditions.values[0];
  if (postCondition.conditionType !== PostConditionType.Fungible) return null;
  if (postCondition.conditionCode !== FungibleConditionCode.Equal) return null;
  if (postCondition.principal.prefix !== PostConditionPrincipalId.Standard) return null;

  return {
    contractId: formatContractIdString({
      contractAddress: addressToString(postCondition.asset.address),
      contractName: postCondition.asset.contractName.content,
    }),
    assetName: postCondition.asset.assetName.content,
    principal: addressToString(postCondition.principal.address),
    amount: postCondition.amount,
  };
}

export function getVerifiedSip10TransferDetails(
  tx: StacksTransactionWire
): Sip10TransferDetails | null {
  if (!isSip10TransferContactCall(tx)) return null;
  const postCondition = getVerifiedSingleFungiblePostCondition(tx);
  if (!postCondition) return null;

  const [amountArg, senderArg, recipientArg, memoArg] = tx.payload.functionArgs;
  if (amountArg.type !== ClarityType.UInt) return null;
  if (senderArg.type !== ClarityType.PrincipalStandard) return null;
  if (recipientArg.type !== ClarityType.PrincipalStandard) return null;

  const amount = BigInt(amountArg.value);
  if (postCondition.amount !== amount) return null;

  const contractId = formatContractIdString({
    contractAddress: addressToString(tx.payload.contractAddress),
    contractName: tx.payload.contractName.content,
  });
  if (postCondition.contractId !== contractId) return null;
  if (postCondition.principal !== senderArg.value) return null;

  return {
    contractId,
    assetName: postCondition.assetName,
    amount,
    sender: senderArg.value,
    recipient: recipientArg.value,
    memo: getMemoString(memoArg),
  };
}

export function isSip10Transfer({
  functionName,
  contractInterfaceData,
}: {
  functionName: string;
  contractInterfaceData: ClarityAbi;
}) {
  if (functionName !== 'transfer') return false;
  const functionInterface = contractInterfaceData?.functions.find(f => f.name === functionName);
  if (
    functionInterface?.args[0]?.name === 'amount' &&
    functionInterface?.args[1]?.name === 'sender' &&
    functionInterface?.args[2]?.name === 'recipient' &&
    functionInterface?.args[3]?.name === 'memo'
  ) {
    return true;
  }
  return false;
}

export function getSip10TransferAmount({
  functionName,
  functionArgs,
  contractInterfaceData,
}: {
  functionName: string;
  functionArgs: ClarityValue[];
  contractInterfaceData: ClarityAbi;
}) {
  if (
    isSip10Transfer({ functionName, contractInterfaceData }) &&
    functionArgs[0]?.type === ClarityType.UInt
  ) {
    return Number(functionArgs[0].value);
  }
  return null;
}

export function getSip10TransferRecipient({
  functionName,
  functionArgs,
  contractInterfaceData,
}: {
  functionName: string;
  functionArgs: ClarityValue[];
  contractInterfaceData: ClarityAbi;
}) {
  if (
    isSip10Transfer({ functionName, contractInterfaceData }) &&
    functionArgs[2]?.type === ClarityType.PrincipalStandard
  ) {
    return functionArgs[2].value;
  }
  return null;
}
