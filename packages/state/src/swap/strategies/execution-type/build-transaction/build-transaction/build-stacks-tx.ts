import { bytesToHex } from '@stacks/common';
import { type StacksNetwork } from '@stacks/network';
import { PostConditionMode, serializeCV } from '@stacks/transactions';

import { type StacksContractCallSwapExecutionData } from '@leather.io/models';
import {
  type StacksSigner,
  TransactionTypes,
  generateStacksUnsignedTransaction,
  getPostConditions,
} from '@leather.io/stacks';
import { createMoney } from '@leather.io/utils';

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
    functionArgs: executionData.functionArgs.map(arg => serializeCV(arg as any)),
    postConditions: getPostConditions(executionData.postConditions as any),
    postConditionMode: PostConditionMode.Deny,
    publicKey: bytesToHex(signer.publicKey),
    sponsored: false,
    network,
    fee,
    nonce,
  });
}
