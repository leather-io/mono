import {
  PayloadType,
  addressToString,
  cvToString,
  deserializeTransaction,
} from '@stacks/transactions';

import { getVerifiedSip10TransferDetails } from './sip-10-contract-call.utils';

export interface StxTransferPayloadDetails {
  type: 'stxTransfer';
  recipient: string;
  amount: bigint;
  memo: string;
  fee: bigint;
}

export interface StxSip10TransferPayloadDetails {
  type: 'sip10Transfer';
  contractId: string;
  assetName: string;
  amount: bigint;
  sender: string;
  recipient: string;
  memo?: string;
  fee: bigint;
}

export interface StxContractCallPayloadDetails {
  type: 'contractCall';
  contractAddress: string;
  contractName: string;
  functionName: string;
  fee: bigint;
}

export interface StxContractDeployPayloadDetails {
  type: 'contractDeploy';
  contractName: string;
  fee: bigint;
}

export type StxTransactionPayloadDetails =
  | StxTransferPayloadDetails
  | StxSip10TransferPayloadDetails
  | StxContractCallPayloadDetails
  | StxContractDeployPayloadDetails;

export function decodeStxTransactionPayload(rawTx: string): StxTransactionPayloadDetails | null {
  const tx = deserializeTransaction(rawTx);
  const fee = tx.auth.spendingCondition.fee;
  switch (tx.payload.payloadType) {
    case PayloadType.TokenTransfer:
      return {
        type: 'stxTransfer',
        recipient: cvToString(tx.payload.recipient),
        amount: tx.payload.amount,
        memo: tx.payload.memo.content,
        fee,
      };
    case PayloadType.ContractCall: {
      const sip10Transfer = getVerifiedSip10TransferDetails(tx);
      if (sip10Transfer) return { type: 'sip10Transfer', ...sip10Transfer, fee };
      return {
        type: 'contractCall',
        contractAddress: addressToString(tx.payload.contractAddress),
        contractName: tx.payload.contractName.content,
        functionName: tx.payload.functionName.content,
        fee,
      };
    }
    case PayloadType.SmartContract:
    case PayloadType.VersionedSmartContract:
      return {
        type: 'contractDeploy',
        contractName: tx.payload.contractName.content,
        fee,
      };
    default:
      return null;
  }
}
