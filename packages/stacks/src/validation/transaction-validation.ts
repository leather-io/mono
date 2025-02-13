import { NetworkConfiguration } from '@leather.io/models';
import { isEmptyString, isUndefined } from '@leather.io/utils';

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

function validateAddress(address: string) {
  if (isUndefined(address) || isEmptyString(address)) {
    return false;
  }
  return true;
}
function validatePayerNotRecipient(senderAddress: string, recipientAddress: string) {
  if (validateAddress(senderAddress) || validateAddress(recipientAddress)) {
    return false;
  }
  if (senderAddress === recipientAddress) {
    return false;
  }
  return true;
}

// Valid main net
// SP1WV9Z2ZBF8AHF1GBSY7D1MT3P4ND2DXFSQRBWHC
// bc1qswevrkzaza2snx0penxpdg0g9fr36tgh9m0gvr

// inValid
// PETEV9Z2ZBF8AHF1GBSY7D1MT3P4ND2DXFSQRBWHC
// peteswevrkzaza2snx0penxpdg0g9fr36tgh9m0gvr
