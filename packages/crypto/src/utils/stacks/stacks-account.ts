import { TransactionPayload } from '@stacks/connect';

import { StacksAccount } from './stacks-account.models';

export function useTransactionAccountIndex({
  stacksAccounts,
  transactionPayload,
}: {
  stacksAccounts: StacksAccount[];
  transactionPayload: TransactionPayload | null;
}) {
  const txAddress = transactionPayload?.stxAddress;
  if (txAddress && stacksAccounts) {
    return stacksAccounts.findIndex(account => account.address === txAddress); // selected account
  }
  return undefined;
}

// Comment below from original atom. This pattern encourages view level
// implementation details to leak into the state structure. Do not do this.
//   This contains the state of the current account:
//   could be the account associated with an in-process transaction request
//   or the last selected / first account of the user
export function useCurrentStacksAccount({
  currentAccountIndex,
  stacksAccounts,
  transactionPayload,
  hasSwitchedAccounts,
  signatureIndex,
}: {
  currentAccountIndex: number;
  stacksAccounts: StacksAccount[];
  transactionPayload: TransactionPayload | null;
  hasSwitchedAccounts: boolean;
  signatureIndex: number | undefined;
}) {
  const txIndex = useTransactionAccountIndex({ stacksAccounts, transactionPayload });

  // ⚠️ to refactor, we should not just continually add new conditionals here
  const hasSwitched = hasSwitchedAccounts;

  const index = txIndex ?? signatureIndex;
  if (!stacksAccounts) return undefined;
  if (typeof index === 'number' && !hasSwitched) return stacksAccounts[index];
  return stacksAccounts[currentAccountIndex];
}
