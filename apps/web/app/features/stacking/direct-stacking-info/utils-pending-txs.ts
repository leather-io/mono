import { ClarityType, type ClarityValue } from '@stacks/transactions';

import type { StacksTransaction } from '@leather.io/models';
import { isDefined } from '@leather.io/utils';

interface ContractCallMetadata {
  contract_call: {
    contract_id: string;
    function_name: string;
  };
}

interface ContractCallTransaction {
  type: 'contract_call';
  tx_id: string;
  contract_call: {
    contract_id: string;
    function_name: string;
    function_args?: { hex: string }[];
  };
}

interface OtherTransaction {
  type: Exclude<StacksTransaction['type'], 'contract_call'>;
}

interface PendingTransactionsClient {
  getPrincipalMempoolTransactions(
    principal: string,
    signal: AbortSignal
  ): Promise<{
    results: { tx_id: string; contract_call?: ContractCallMetadata['contract_call'] }[];
  }>;
  getTransactionById(
    txid: string,
    signal: AbortSignal,
    include: 'function_args'[]
  ): Promise<ContractCallTransaction | OtherTransaction>;
}

type TransactionPredicate = (t: ContractCallMetadata) => boolean;
type TransactionConverter<T> = (t: ContractCallTransaction) => T;

export interface PendingTransactionArgs {
  stacksClient: PendingTransactionsClient;
  address: string;
}

interface GetHasPendingTransactionArgs<T> extends PendingTransactionArgs {
  transactionPredicate: TransactionPredicate;
  transactionConverter: TransactionConverter<T>;
}

export async function getHasPendingTransaction<T>({
  stacksClient,
  address,
  transactionPredicate,
  transactionConverter: txToDataConverter,
}: GetHasPendingTransactionArgs<T>): Promise<null | T> {
  const signal = new AbortController().signal;
  const mempoolTransactions = await stacksClient.getPrincipalMempoolTransactions(address, signal);

  const pendingContractCall = mempoolTransactions.results.find(
    ({ contract_call }) => isDefined(contract_call) && transactionPredicate({ contract_call })
  );
  if (!pendingContractCall) return null;

  const transaction = await stacksClient.getTransactionById(pendingContractCall.tx_id, signal, [
    'function_args',
  ]);
  if (transaction.type !== 'contract_call') return null;

  return txToDataConverter(transaction);
}

export function expectUintCV(valueCV: ClarityValue, argName: string) {
  if (!valueCV || valueCV.type !== ClarityType.UInt) {
    throw new Error(`Expected '${argName}' to be of type 'UInt'.`);
  }
  return BigInt(valueCV.value);
}
