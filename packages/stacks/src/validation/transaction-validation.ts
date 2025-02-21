import { ChainId, Money } from '@leather.io/models';

import {
  isValidAddressChain,
  isValidStacksAddress,
  validatePayerNotRecipient,
} from './address-validation';
import { StacksError } from './stacks-error';

interface StacksTransaction {
  amount: Money;
  payer: string;
  recipient: string;
  chainId: ChainId;
}

export function isValidStacksTransaction({ amount, payer, recipient, chainId }: StacksTransaction) {
  if (!isValidStacksAddress(payer) || !isValidStacksAddress(recipient)) {
    throw new StacksError('InvalidAddress');
  }
  if (!isValidAddressChain(payer, chainId) || !isValidAddressChain(recipient, chainId)) {
    throw new StacksError('InvalidNetworkAddress');
  }
  if (!validatePayerNotRecipient(payer, recipient)) {
    throw new StacksError('InvalidSameAddress');
  }
}
