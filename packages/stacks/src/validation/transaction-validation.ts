import { ChainId } from '@leather.io/models';

import {
  isValidAddressChain,
  isValidStacksAddress,
  validatePayerNotRecipient,
} from './address-validation';
import { StacksError } from './stacks-error';

export function isValidStacksTransaction(
  senderAddress: string,
  recipientAddress: string,
  chainId: ChainId
) {
  if (!isValidStacksAddress(senderAddress) || !isValidStacksAddress(recipientAddress)) {
    throw new StacksError('InvalidAddress');
  }
  if (
    !isValidAddressChain(senderAddress, chainId) ||
    !isValidAddressChain(recipientAddress, chainId)
  ) {
    throw new StacksError('InvalidNetworkAddress');
  }
  if (!validatePayerNotRecipient(senderAddress, recipientAddress)) {
    throw new StacksError('InvalidSameAddress');
  }
}

//  PETE - need to add more stacks validation here and take in changes from https://github.com/leather-io/extension/pull/6125 for send max
