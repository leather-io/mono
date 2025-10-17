import {
  ClarityAbi,
  ClarityType,
  ClarityValue,
  ContractCallPayload,
  StacksTransactionWire,
} from '@stacks/transactions';

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
