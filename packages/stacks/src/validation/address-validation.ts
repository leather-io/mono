import { c32addressDecode } from 'c32check';

import { ChainId } from '@leather.io/models';
import { isEmptyString, isUndefined } from '@leather.io/utils';

// taken from stacks-utils.ts
export function isValidStacksAddress(address: string) {
  if (isUndefined(address) || isEmptyString(address)) {
    return false;
  }
  try {
    c32addressDecode(address);
    return true;
  } catch {
    return false;
  }
}

export function isValidAddressChain(address: string, chainId: ChainId) {
  const prefix = address.slice(0, 2);
  switch (chainId) {
    case ChainId.Mainnet:
      return prefix === 'SM' || prefix === 'SP';
    case ChainId.Testnet:
      return prefix === 'SN' || prefix === 'ST';
    default:
      return false;
  }
}

function validateAddress(address: string) {
  if (isUndefined(address) || isEmptyString(address)) {
    return false;
  }
  return true;
}
export function validatePayerNotRecipient(senderAddress: string, recipientAddress: string) {
  if (validateAddress(senderAddress) || validateAddress(recipientAddress)) {
    return false;
  }
  if (senderAddress === recipientAddress) {
    return false;
  }
  return true;
}