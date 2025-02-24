import { ChainId, Money } from '@leather.io/models';

import {
  isValidAddressChain,
  isValidStacksAddress,
  validatePayerNotRecipient,
} from './address-validation';
import { StacksError } from './stacks-error';

interface StacksTransaction {
  amount: Money;
  payer: string; // TODO add branded type for Stacks address
  recipient: string; // TODO add branded type for Stacks address
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

  // // TODO - move is isValidTransactionAmount into stx package and check in isValidTransaction
  // if (
  //   !isValidTransactionAmount({
  //     availableBalance,
  //     amount: +amount,
  //     fee: +fee,
  //     unitConverter: stxToMicroStx,
  //   })
  // ) {
  //   // throw new StacksError('InsufficientFunds');
  // }

  // TODO implement a simple version of Send Max - design seems newer anyway so do it simpler then update
}
