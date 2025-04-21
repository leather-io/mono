import {
  ClarityValue,
  createAddress,
  deserializeCV,
  noneCV,
  standardPrincipalCVFromAddress,
  uintCV,
} from '@stacks/transactions';

interface GetSip10FnArgs {
  amount: number;
  senderStacksAddress: string;
  recipientStacksAddress: string;
}

export function createSip10FnArgs({
  amount,
  senderStacksAddress,
  recipientStacksAddress,
}: GetSip10FnArgs) {
  const fnArgs: ClarityValue[] = [
    uintCV(amount),
    standardPrincipalCVFromAddress(createAddress(senderStacksAddress)),
    standardPrincipalCVFromAddress(createAddress(recipientStacksAddress)),
    noneCV(), // Add memo to SIP-30?
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
