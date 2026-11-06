import {
  type UnsignedContractCallOptions,
  type UnsignedContractDeployOptions,
  type UnsignedMultiSigContractCallOptions,
  type UnsignedMultiSigContractDeployOptions,
  type UnsignedMultiSigTokenTransferOptions,
  type UnsignedTokenTransferOptions,
} from '@stacks/transactions';

import { type Money, type ReplaceTypes } from '@leather.io/models';

export const TransactionTypes = {
  ContractCall: 'contract_call',
  ContractDeploy: 'smart_contract',
  StxTokenTransfer: 'token_transfer',
} as const;
export type TransactionTypes = (typeof TransactionTypes)[keyof typeof TransactionTypes];

export function isTransactionTypeSupported(txType: TransactionTypes) {
  return (
    txType === TransactionTypes.ContractCall ||
    txType === TransactionTypes.ContractDeploy ||
    txType === TransactionTypes.StxTokenTransfer
  );
}

export type StacksUnsignedSingleSigContractCallOptions = ReplaceTypes<
  UnsignedContractCallOptions,
  {
    fee: Money;
    functionArgs: string[];
    nonce: number | string;
  }
> & { txType: typeof TransactionTypes.ContractCall };

export type StacksUnsignedMultiSigContractCallOptions = ReplaceTypes<
  UnsignedMultiSigContractCallOptions,
  {
    fee: Money;
    functionArgs: string[];
    nonce: number | string;
  }
> & { txType: typeof TransactionTypes.ContractCall };

export type StacksUnsignedContractCallOptions =
  | StacksUnsignedSingleSigContractCallOptions
  | StacksUnsignedMultiSigContractCallOptions;

export type StacksUnsignedSingleSigContractDeployOptions = ReplaceTypes<
  UnsignedContractDeployOptions,
  {
    fee: Money;
    nonce: number | string;
  }
> & { txType: typeof TransactionTypes.ContractDeploy };

export type StacksUnsignedMultiSigContractDeployOptions = ReplaceTypes<
  UnsignedMultiSigContractDeployOptions,
  {
    fee: Money;
    nonce: number | string;
  }
> & { txType: typeof TransactionTypes.ContractDeploy };

export type StacksUnsignedContractDeployOptions =
  | StacksUnsignedSingleSigContractDeployOptions
  | StacksUnsignedMultiSigContractDeployOptions;

export type StacksUnsignedTokenTransferOptions = ReplaceTypes<
  UnsignedTokenTransferOptions,
  {
    amount: Money;
    fee: Money;
    nonce: number | string;
  }
> & { txType: typeof TransactionTypes.StxTokenTransfer };

export type StacksUnsignedMultiSigTokenTransferOptions = ReplaceTypes<
  UnsignedMultiSigTokenTransferOptions,
  {
    amount: Money;
    fee: Money;
    nonce: number | string;
  }
> & { txType: typeof TransactionTypes.StxTokenTransfer };

export type StacksUnsignedStxTokenTransferOptions =
  | StacksUnsignedTokenTransferOptions
  | StacksUnsignedMultiSigTokenTransferOptions;

export type StacksUnsignedTransactionOptions =
  | StacksUnsignedContractCallOptions
  | StacksUnsignedContractDeployOptions
  | StacksUnsignedStxTokenTransferOptions;

export type StacksUnsignedSingleSigTransactionOptions =
  | StacksUnsignedSingleSigContractCallOptions
  | StacksUnsignedSingleSigContractDeployOptions
  | StacksUnsignedTokenTransferOptions;

export type StacksUnsignedMultiSigTransactionOptions =
  | StacksUnsignedMultiSigContractCallOptions
  | StacksUnsignedMultiSigContractDeployOptions
  | StacksUnsignedMultiSigTokenTransferOptions;
