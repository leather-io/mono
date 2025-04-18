import { StackingClient } from '@stacks/stacking';
import {
  ContractCallTransaction,
  ContractCallTransactionMetadata,
  MempoolContractCallTransaction,
  MempoolTransaction,
  Transaction,
} from '@stacks/stacks-blockchain-api-types';
import { ClarityType, ClarityValue, hexToCV } from '@stacks/transactions';
import { isContractCallTransaction, isMempoolContractCallTransaction } from '~/utils/transactions';

import { StacksClient } from '@leather.io/query';

export type TransactionPredicate = (
  t: ContractCallTransactionMetadata,
  poxContractId: string
) => boolean;
export type TransactionConverter<T> = (
  t: ContractCallTransaction | MempoolContractCallTransaction
) => T;

export interface PendingTransactionArgs {
  stackingClient: StackingClient;
  stacksClient: StacksClient;
  address: string;
}

/**
 * Given an array of transactions, ordered from most recent to least recent, returns the most recent
 * successful unanchored transaction calling the PoX's `stack-stx` function in a microblock.
 */
function findUnanchoredTransaction(
  transactions: Transaction[],
  // Until PoX 2 has been fully activated, using this arg to determine the PoX contract id. Once
  // active, this value can be set to a constant.
  poxContractId: string,
  isGoodTransaction: TransactionPredicate
): ContractCallTransaction | undefined {
  return transactions.find(t => {
    if (!isContractCallTransaction(t)) return false;
    if (!t.is_unanchored) return false;

    const transactionResultCV = hexToCV(t.tx_result.hex);
    const isOk = transactionResultCV.type === ClarityType.ResponseOk;
    return isOk && isGoodTransaction(t, poxContractId);
  }) as ContractCallTransaction; // Casting as type is checked in `if` statement above.
}
/**
 * Given an array of transactions, ordered from most recent to least recent, returns the most recent
 * transaction calling the PoX's `stack-stx` function in the mempool.
 */
function findMempoolTransaction(
  transactions: MempoolTransaction[],
  // Until PoX 2 has been fully activated, using this arg to determine the PoX contract id. Once
  // active, this value can be set to a constant.
  poxContractId: string,
  isGoodTransaction: TransactionPredicate
) {
  return transactions.find(t => {
    if (!isMempoolContractCallTransaction(t)) return false;

    return isGoodTransaction(t, poxContractId);
  }) as MempoolContractCallTransaction; // Casting as type is checked in `if` statement above.
}

interface GetHasPendingTransactionArgs<T> extends PendingTransactionArgs {
  transactionPredicate: TransactionPredicate;
  transactionConverter: TransactionConverter<T>;
}

export async function getHasPendingTransaction<T>({
  stackingClient,
  stacksClient,
  address,
  transactionPredicate,
  transactionConverter: txToDataConverter,
}: GetHasPendingTransactionArgs<T>): Promise<null | T> {
  const signal = new AbortController().signal;
  const [contractPrincipal, accountTransactions, mempoolTransactions] = await Promise.all([
    stackingClient.getStackingContract(),
    stacksClient.getAccountTransactionsWithTransfers(address, signal),
    stacksClient.getAddressMempoolTransactions(address, signal),
  ]);

  // NOTE: `results` needs to be cast due to known issues with types,
  // https://github.com/hirosystems/stacks-blockchain-api/tree/master/client#known-issues
  const accountTransaction = findUnanchoredTransaction(
    accountTransactions.results.map(r => r.tx),
    contractPrincipal,
    transactionPredicate
  );
  const mempoolTransaction = findMempoolTransaction(
    mempoolTransactions.results,
    contractPrincipal,
    transactionPredicate
  );

  const transaction = getBestTransaction(accountTransaction, mempoolTransaction);

  if (transaction) {
    return txToDataConverter(transaction);
  }

  return null;
}

export function getBestTransaction(
  accountTransaction: ContractCallTransaction | undefined,
  mempoolTransaction: MempoolContractCallTransaction
) {
  if (!accountTransaction && mempoolTransaction) {
    return mempoolTransaction;
  } else if (accountTransaction && !mempoolTransaction) {
    return accountTransaction;
  } else if (accountTransaction && mempoolTransaction) {
    return accountTransaction.nonce > mempoolTransaction.nonce
      ? accountTransaction
      : mempoolTransaction;
  }
  return undefined;
}

export function expectUintCV(valueCV: ClarityValue, argName: string) {
  if (!valueCV || valueCV.type !== ClarityType.UInt) {
    throw new Error(`Expected '${argName}' to be of type 'UInt'.`);
  }
  return BigInt(valueCV.value);
}
