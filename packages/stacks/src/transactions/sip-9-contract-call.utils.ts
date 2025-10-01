import { ClarityAbi, ClarityType, ClarityValue } from '@stacks/transactions';

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
