import {
  UnsignedContractCallOptions,
  UnsignedContractDeployOptions,
  UnsignedTokenTransferOptions,
} from '@stacks/transactions';

import { Money, ReplaceTypes } from '@leather.io/models';

export enum TransactionTypes {
  ContractCall = 'contract_call',
  ContractDeploy = 'smart_contract',
  StxTokenTransfer = 'token_transfer',
}

export function isTransactionTypeSupported(txType: TransactionTypes) {
  return (
    txType === TransactionTypes.ContractCall ||
    txType === TransactionTypes.ContractDeploy ||
    txType === TransactionTypes.StxTokenTransfer
  );
}

export type StacksUnsignedContractCallOptions = ReplaceTypes<
  UnsignedContractCallOptions,
  {
    fee?: Money;
    functionArgs: string[];
    nonce?: number | string;
  }
> & { txType: TransactionTypes.ContractCall };

export type StacksUnsignedContractDeployOptions = ReplaceTypes<
  UnsignedContractDeployOptions,
  {
    fee?: Money;
    nonce?: number | string;
  }
> & { txType: TransactionTypes.ContractDeploy };

export type StacksUnsignedTokenTransferOptions = ReplaceTypes<
  UnsignedTokenTransferOptions,
  {
    amount: Money;
    fee?: Money;
    nonce?: number | string;
  }
> & { txType: TransactionTypes.StxTokenTransfer };

export type StacksUnsignedTransactionOptions =
  | StacksUnsignedContractCallOptions
  | StacksUnsignedContractDeployOptions
  | StacksUnsignedTokenTransferOptions;
