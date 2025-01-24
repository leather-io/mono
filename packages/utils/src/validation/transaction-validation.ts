import { isEmptyString, isUndefined } from '../index';

export function validatePayerNotRecipient(senderAddress: string, recipientAddress: string) {
  if (
    isUndefined(senderAddress) ||
    isEmptyString(senderAddress) ||
    isUndefined(recipientAddress) ||
    isEmptyString(recipientAddress)
  ) {
    return false;
  }
  if (senderAddress === recipientAddress) {
    return false;
  }
  return true;
}
