import type { StacksNetwork } from '@stacks/network';
import type { PostCondition, PostConditionMode, PostConditionWire } from '@stacks/transactions';

import type { TransactionTypes } from '@leather.io/stacks';

interface TransactionPayloadBase {
  network: StacksNetwork;
  postConditionMode?: PostConditionMode;
  postConditions?: PostCondition[] | PostConditionWire[];
  publicKey: string;
  sponsored?: boolean;
}

export interface ContractCallPayload extends TransactionPayloadBase {
  txType: TransactionTypes.ContractCall;
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: string[];
}

export interface ContractDeployPayload extends TransactionPayloadBase {
  txType: TransactionTypes.ContractDeploy;
  contractName: string;
  codeBody: string;
}

export interface STXTransferPayload extends TransactionPayloadBase {
  txType: TransactionTypes.StxTokenTransfer;
  recipient: string;
  amount: string;
  memo?: string;
}
