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

import { cleanHex } from '../stacks.utils';

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

function getMemoString(arg: ClarityValue | undefined): string | undefined {
  if (!arg || arg.type !== ClarityType.OptionalSome) return undefined;
  if (arg.value.type !== ClarityType.Buffer) return undefined;
  return bytesToUtf8(hexToBytes(cleanHex(arg.value.value)));
}

export function getVerifiedSip10TransferDetails(
  tx: StacksTransactionWire
): Sip10TransferDetails | null {
  if (!isSip10TransferContactCall(tx)) return null;
  if (tx.postConditionMode !== PostConditionMode.Deny) return null;
  if (tx.postConditions.values.length !== 1) return null;

  const postCondition = tx.postConditions.values[0];
  if (postCondition.conditionType !== PostConditionType.Fungible) return null;
  if (postCondition.conditionCode !== FungibleConditionCode.Equal) return null;
  if (postCondition.principal.prefix !== PostConditionPrincipalId.Standard) return null;

  const [amountArg, senderArg, recipientArg, memoArg] = tx.payload.functionArgs;
  if (amountArg.type !== ClarityType.UInt) return null;
  if (senderArg.type !== ClarityType.PrincipalStandard) return null;
  if (recipientArg.type !== ClarityType.PrincipalStandard) return null;

  const amount = BigInt(amountArg.value);
  if (postCondition.amount !== amount) return null;

  const contractId = `${addressToString(tx.payload.contractAddress)}.${tx.payload.contractName.content}`;
  const postConditionContractId = `${addressToString(postCondition.asset.address)}.${postCondition.asset.contractName.content}`;
  if (postConditionContractId !== contractId) return null;

  if (addressToString(postCondition.principal.address) !== senderArg.value) return null;

  return {
    contractId,
    assetName: postCondition.asset.assetName.content,
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
