import {
  ClarityAbi,
  ClarityType,
  ClarityValue,
  ContractCallPayload,
  StacksTransactionWire,
} from '@stacks/transactions';

export function isSip9TransferContactCall(
  tx: StacksTransactionWire
): tx is StacksTransactionWire & { payload: ContractCallPayload } {
  if (tx.payload && 'functionName' in tx.payload) {
    if (tx.payload.functionName.content === 'transfer' && tx.payload.functionArgs.length === 3) {
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

export function isSip9Transfer({
  functionName,
  contractInterfaceData,
}: {
  functionName: string;
  contractInterfaceData: ClarityAbi;
}) {
  if (functionName !== 'transfer') return false;
  const functionInterface = contractInterfaceData?.functions.find(f => f.name === functionName);
  if (
    functionInterface?.args[0]?.name === 'id' &&
    functionInterface?.args[1]?.name === 'from' &&
    functionInterface?.args[2]?.name === 'to'
  ) {
    return true;
  }
  return false;
}

export function getSip9TransferRecipient({
  functionName,
  functionArgs,
  contractInterfaceData,
}: {
  functionName: string;
  functionArgs: ClarityValue[];
  contractInterfaceData: ClarityAbi;
}) {
  if (
    isSip9Transfer({ functionName, contractInterfaceData }) &&
    functionArgs[2]?.type === ClarityType.PrincipalStandard
  ) {
    return functionArgs[2].value;
  }
  return null;
}
