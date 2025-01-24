import { NetworkConfiguration } from '@leather.io/models';
import { validatePayerNotRecipient } from '@leather.io/utils';

import { isValidAddressChain, isValidStacksAddress } from './address-validation';
import { StacksError } from './stacks-error';

export function isValidStacksTransaction(
  senderAddress: string,
  recipientAddress: string,
  currentNetwork: NetworkConfiguration
) {
  if (!isValidStacksAddress(senderAddress) || !isValidStacksAddress(recipientAddress)) {
    throw new StacksError('InvalidAddress');
  }
  if (
    !isValidAddressChain(senderAddress, currentNetwork) ||
    !isValidAddressChain(recipientAddress, currentNetwork)
  ) {
    throw new StacksError('InvalidNetworkAddress');
  }
  if (!validatePayerNotRecipient(senderAddress, recipientAddress)) {
    throw new StacksError('InvalidSameAddress');
  }
}
