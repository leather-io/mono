import { bytesToHex } from '@stacks/common';
import { type StacksNetwork } from '@stacks/network';
import {
  type ClarityValue,
  type PostCondition,
  PostConditionMode,
  type PostConditionWire,
  serializeCV,
} from '@stacks/transactions';
import z from 'zod';

import { type StacksContractCallSwapExecutionData } from '@leather.io/models';
import {
  type StacksSigner,
  TransactionTypes,
  generateStacksUnsignedTransaction,
  getPostConditions,
} from '@leather.io/stacks';
import { createMoney } from '@leather.io/utils';

type PostConditionInput = string | PostCondition | PostConditionWire;

const clarityValueSchema = z.custom<ClarityValue>(
  value => typeof value === 'object' && value !== null && 'type' in value,
  'Invalid Clarity value in swap function args'
);

const postConditionInputSchema = z.custom<PostConditionInput>(
  value => typeof value === 'string' || (typeof value === 'object' && value !== null),
  'Invalid post condition in swap execution data'
);

export async function buildStacksTx(
  executionData: StacksContractCallSwapExecutionData,
  network: StacksNetwork,
  signer: StacksSigner,
  fee = createMoney(0, 'STX'),
  nonce = 0
) {
  return generateStacksUnsignedTransaction({
    txType: TransactionTypes.ContractCall,
    contractAddress: executionData.contractAddress,
    contractName: executionData.contractName,
    functionName: executionData.functionName,
    // TODO: Clarify why functionArgs and postConditions are unknown[]
    functionArgs: executionData.functionArgs.map(arg => serializeCV(clarityValueSchema.parse(arg))),
    postConditions: getPostConditions(
      executionData.postConditions.map(postCondition =>
        postConditionInputSchema.parse(postCondition)
      )
    ),
    postConditionMode: PostConditionMode.Deny,
    publicKey: bytesToHex(signer.publicKey),
    sponsored: false,
    network,
    fee,
    nonce,
  });
}
