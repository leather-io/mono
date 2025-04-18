import {
  ContractCallTransaction,
  ContractCallTransactionMetadata,
  MempoolContractCallTransaction,
} from '@stacks/stacks-blockchain-api-types';
import { hexToCV } from '@stacks/transactions';

import {
  PendingTransactionArgs,
  expectUintCV,
  getHasPendingTransaction,
} from './utils-pending-txs';

function isStackIncreaseCall(
  t: ContractCallTransactionMetadata,

  // Until PoX 2 has been fully activated, using this arg to determine the PoX contract id. Once
  // active, this value can be set to a constant.
  poxContractId: string
) {
  return (
    t.contract_call.function_name === 'stack-increase' &&
    t.contract_call.contract_id === poxContractId
  );
}

export interface StackIncreaseInfo {
  transactionId: string;
  increaseBy: bigint;
}

// TODO: Types. For now assuming callers only provide a `stack-stx` pox call transaction.
function getStackIncreaseFromTransaction(
  transaction: ContractCallTransaction | MempoolContractCallTransaction
): StackIncreaseInfo {
  const args = transaction.contract_call.function_args;
  if (!args) {
    // TODO: log error
    throw new Error('Expected `args` to be defined.');
  }
  const [increaseByCV] = args.map(arg => hexToCV(arg.hex));
  const increaseBy = expectUintCV(increaseByCV, 'increaseBy');

  return {
    transactionId: transaction.tx_id,
    increaseBy,
  };
}

export async function getHasPendingStackIncrease({
  stackingClient,
  stacksClient,
  address,
}: PendingTransactionArgs): Promise<null | StackIncreaseInfo> {
  return getHasPendingTransaction({
    stackingClient,
    stacksClient,
    address,
    transactionPredicate: isStackIncreaseCall,
    transactionConverter: getStackIncreaseFromTransaction,
  });
}
