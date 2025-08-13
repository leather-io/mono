import { ClarityAbi, ClarityType, ClarityValue } from '@stacks/transactions';

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
