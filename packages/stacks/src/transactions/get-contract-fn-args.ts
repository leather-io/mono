import {
  ClarityValue,
  bufferCVFromString,
  createAddress,
  deserializeCV,
  noneCV,
  someCV,
  standardPrincipalCVFromAddress,
  uintCV,
} from '@stacks/transactions';

interface GetSip10FnArgs {
  amount: number | string;
  senderStacksAddress: string;
  recipientStacksAddress: string;
  memo?: string;
}

export function createSip10FnArgs({
  amount,
  senderStacksAddress,
  recipientStacksAddress,
  memo,
}: GetSip10FnArgs) {
  const fnArgs: ClarityValue[] = [
    uintCV(amount),
    standardPrincipalCVFromAddress(createAddress(senderStacksAddress)),
    standardPrincipalCVFromAddress(createAddress(recipientStacksAddress)),
    memo && memo !== '' ? someCV(bufferCVFromString(memo)) : noneCV(),
  ];
  return fnArgs;
}

interface GetSip9FnArgs {
  assetId: string;
  senderStacksAddress: string;
  recipientStacksAddress: string;
}
export function createSip9FnArgs({
  assetId,
  senderStacksAddress,
  recipientStacksAddress,
}: GetSip9FnArgs) {
  const fnArgs: ClarityValue[] = [
    deserializeCV(assetId),
    standardPrincipalCVFromAddress(createAddress(senderStacksAddress)),
    standardPrincipalCVFromAddress(createAddress(recipientStacksAddress)),
  ];
  return fnArgs;
}
