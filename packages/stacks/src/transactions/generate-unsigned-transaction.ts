import { hexToBytes } from '@noble/hashes/utils';
import {
  deserializeCV,
  makeUnsignedContractCall,
  makeUnsignedContractDeploy,
  makeUnsignedSTXTokenTransfer,
} from '@stacks/transactions';
import BigNumber from 'bignumber.js';

import { assertUnreachable } from '@leather.io/utils';

import { cleanHex } from '../stacks.utils';
import { getPostConditions } from './post-condition.utils';
import {
  StacksUnsignedContractCallOptions,
  StacksUnsignedContractDeployOptions,
  StacksUnsignedTokenTransferOptions,
  StacksUnsignedTransactionOptions,
  TransactionTypes,
  isTransactionTypeSupported,
} from './transaction.types';

export function initNonce(nonce: number | string) {
  return new BigNumber(nonce, 10);
}

export function generateUnsignedContractCall(options: StacksUnsignedContractCallOptions) {
  const { fee, functionArgs, nonce, postConditions } = options;

  const fnArgs = functionArgs.map(arg => deserializeCV(hexToBytes(cleanHex(arg))));

  const parsedOptions = {
    fee: fee.amount.toString(),
    functionArgs: fnArgs,
    nonce: initNonce(nonce).toString(),
    postConditions: getPostConditions(postConditions),
  };

  return makeUnsignedContractCall({ ...options, ...parsedOptions });
}

export function generateUnsignedContractDeploy(options: StacksUnsignedContractDeployOptions) {
  const { fee, nonce, postConditions } = options;

  const parsedOptions = {
    fee: fee.amount.toString(),
    nonce: initNonce(nonce).toString(),
    postConditions: getPostConditions(postConditions),
  };

  return makeUnsignedContractDeploy({ ...options, ...parsedOptions });
}

export function generateUnsignedStxTokenTransfer(options: StacksUnsignedTokenTransferOptions) {
  const { amount, fee, nonce } = options;

  const parsedOptions = {
    amount: amount.amount.toString(),
    fee: fee.amount.toString(),
    nonce: initNonce(nonce).toString(),
  };

  return makeUnsignedSTXTokenTransfer({ ...options, ...parsedOptions });
}

export async function generateStacksUnsignedTransaction(options: StacksUnsignedTransactionOptions) {
  const { txType } = options;

  const isValid = isTransactionTypeSupported(txType);

  if (!isValid) throw new Error(`Invalid Transaction Type: ${txType}`);

  switch (txType) {
    case TransactionTypes.StxTokenTransfer:
      return generateUnsignedStxTokenTransfer(options);
    case TransactionTypes.ContractCall:
      return generateUnsignedContractCall(options);
    case TransactionTypes.ContractDeploy:
      return generateUnsignedContractDeploy(options);
    default:
      assertUnreachable(txType);
  }
}
