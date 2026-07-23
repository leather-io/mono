import { hexToBytes } from '@noble/hashes/utils';
import {
  ClarityVersion,
  createSmartContractPayload,
  deserializeCV,
  makeUnsignedContractCall,
  makeUnsignedContractDeploy,
  makeUnsignedSTXTokenTransfer,
} from '@stacks/transactions';
import BigNumber from 'bignumber.js';

import { assertUnreachable } from '@leather.io/utils';

import { cleanHex } from '../stacks.utils';
import { ensurePostConditionWireFormat, getPostConditions } from './post-condition.utils';
import {
  StacksUnsignedContractCallOptions,
  StacksUnsignedContractDeployOptions,
  StacksUnsignedStxTokenTransferOptions,
  StacksUnsignedTransactionOptions,
  TransactionTypes,
  isTransactionTypeSupported,
} from './transaction.types';

export function initNonce(nonce: number | string) {
  return new BigNumber(nonce, 10);
}

export function getUnsignedContractCallParsedOptions(
  options: StacksUnsignedContractCallOptions
): Parameters<typeof makeUnsignedContractCall>[0] {
  return {
    ...options,
    fee: options.fee.amount.toString(),
    functionArgs: options.functionArgs.map(arg => deserializeCV(hexToBytes(cleanHex(arg)))),
    nonce: initNonce(options.nonce).toString(),
    postConditions: options.postConditions,
  };
}

export function getUnsignedContractDeployParsedOptions(
  options: StacksUnsignedContractDeployOptions
): Parameters<typeof makeUnsignedContractDeploy>[0] {
  return {
    ...options,
    fee: options.fee.amount.toString(),
    nonce: initNonce(options.nonce).toString(),
    postConditions: getPostConditions(
      options.postConditions?.map(pc => ensurePostConditionWireFormat(pc))
    ),
  };
}

function shouldUseNodeDefaultClarityVersion(clarityVersion?: ClarityVersion) {
  return clarityVersion === undefined || clarityVersion === ClarityVersion.Clarity6;
}

async function generateUnsignedContractDeployTransaction(
  options: StacksUnsignedContractDeployOptions
) {
  const transaction = await makeUnsignedContractDeploy(
    getUnsignedContractDeployParsedOptions(options)
  );
  if (shouldUseNodeDefaultClarityVersion(options.clarityVersion))
    transaction.payload = createSmartContractPayload(options.contractName, options.codeBody);
  return transaction;
}

export function getUnsignedStxTokenTransferParsedOptions(
  options: StacksUnsignedStxTokenTransferOptions
): Parameters<typeof makeUnsignedSTXTokenTransfer>[0] {
  return {
    ...options,
    amount: options.amount.amount.toString(),
    fee: options.fee.amount.toString(),
    nonce: initNonce(options.nonce).toString(),
  };
}

export function generateStacksUnsignedTransaction(options: StacksUnsignedTransactionOptions) {
  const { txType } = options;

  const isValid = isTransactionTypeSupported(txType);

  if (!isValid) throw new Error(`Invalid Transaction Type: ${txType}`);

  switch (txType) {
    case TransactionTypes.StxTokenTransfer:
      return makeUnsignedSTXTokenTransfer(getUnsignedStxTokenTransferParsedOptions(options));
    case TransactionTypes.ContractCall:
      return makeUnsignedContractCall(getUnsignedContractCallParsedOptions(options));
    case TransactionTypes.ContractDeploy:
      return generateUnsignedContractDeployTransaction(options);
    default:
      assertUnreachable(txType);
  }
}
