import { StacksAccount } from './stacks-account.models';

// Comment below from original atom. This pattern encourages view level
// implementation details to leak into the state structure. Do not do this.
//   This contains the state of the current account:
//   could be the account associated with an in-process transaction request
//   or the last selected / first account of the user
export function getCurrentStacksAccount({
  currentAccountIndex,
  stacksAccounts,
  hasSwitchedAccounts,
  stacksIndex,
}: {
  currentAccountIndex: number;
  stacksAccounts: StacksAccount[];
  hasSwitchedAccounts: boolean;
  stacksIndex: number | undefined;
}) {
  // ⚠️ to refactor, we should not just continually add new conditionals here
  const hasSwitched = hasSwitchedAccounts;

  if (!stacksAccounts) return undefined;
  if (typeof stacksIndex === 'number' && !hasSwitched) return stacksAccounts[stacksIndex];
  return stacksAccounts[currentAccountIndex];
}
