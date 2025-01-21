import { ChainId, Money } from '@leather.io/models';

import {
  isValidAddressChain,
  isValidStacksAddress,
  validatePayerNotRecipient,
} from './address-validation';
import { isStxAmountValid, isStxBalanceSufficient } from './amount-validation';
import { StacksError } from './stacks-error';

interface StacksTransaction {
  amount: Money;
  payer: string;
  recipient: string;
  chainId: ChainId;
  availableBalance: Money;
  fee: Money;
}

export function isValidStacksTransaction({
  amount,
  availableBalance,
  fee,
  payer,
  recipient,
  chainId,
}: StacksTransaction) {
  if (!isValidStacksAddress(payer) || !isValidStacksAddress(recipient)) {
    throw new StacksError('InvalidAddress');
  }
  if (!isValidAddressChain(payer, chainId) || !isValidAddressChain(recipient, chainId)) {
    throw new StacksError('InvalidNetworkAddress');
  }
  if (!validatePayerNotRecipient(payer, recipient)) {
    throw new StacksError('InvalidSameAddress');
  }

  if (!isStxAmountValid({ availableBalance, amount, fee })) {
    throw new StacksError('InvalidAmount');
  }
  if (!isStxBalanceSufficient({ availableBalance, amount, fee })) {
    throw new StacksError('InsufficientFunds');
  }
  return true;
}
