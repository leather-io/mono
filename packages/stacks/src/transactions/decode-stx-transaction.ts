import {
  PayloadType,
  addressToString,
  cvToString,
  deserializeTransaction,
} from '@stacks/transactions';

export interface StxTransferPayloadDetails {
  type: 'stxTransfer';
  recipient: string;
  amount: bigint;
  memo: string;
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
    case PayloadType.ContractCall:
      return {
        type: 'contractCall',
        contractAddress: addressToString(tx.payload.contractAddress),
        contractName: tx.payload.contractName.content,
        functionName: tx.payload.functionName.content,
        fee,
      };
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
