// from extension src/app/common/account-restoration/account-restore.ts
import { createCounter, fibonacciGenerator } from '@leather.io/utils';

const numOfEmptyAccountsToCheck = 20;

interface AccountIndexActivityCheckHistory {
  index: number;
  hasActivity: boolean;
}

function minNumberOfAccountsNotChecked(num: number) {
  return num < numOfEmptyAccountsToCheck;
}

function anyOfLastCheckedAccountsHaveActivity(arr: AccountIndexActivityCheckHistory[]) {
  return arr.slice(arr.length - numOfEmptyAccountsToCheck).some(check => check.hasActivity);
}

function returnHighestIndex(arr: AccountIndexActivityCheckHistory[]) {
  return Math.max(0, ...arr.filter(check => check.hasActivity).map(check => check.index));
}

async function recurseUntilGeneratorDone(generator: AsyncGenerator): Promise<any> {
  const result = await generator.next();
  if (result.done) return result.value;
  return recurseUntilGeneratorDone(generator);
}

interface RecurseAccountsForActivityArgs {
  doesAddressHaveActivityFn(index: number): Promise<boolean>;
}

/**
 * Used to recursively look for account activity. The use case is that, when
 * restoring an account, we want to know how many accounts to generate. This
 * function makes no assumption as to what constitutes an active account. It
 * takes a function that returns a boolean. If true, it means that the account
 * at the given index is considered to have activity.
 *
 * Original PR was https://github.com/leather-io/extension/pull/3026
 */
export async function recurseAccountsForActivity({
  doesAddressHaveActivityFn,
}: RecurseAccountsForActivityArgs): Promise<number> {
  async function* findHighestAddressIndexExponent() {
    const fibonacci = fibonacciGenerator(2);
    const activity: AccountIndexActivityCheckHistory[] = [];

    while (activity.length === 0 || activity[activity.length - 1]?.hasActivity) {
      const index = fibonacci.next().value;
      const hasActivity = await doesAddressHaveActivityFn(index);
      console.log('doesAddressHaveActivityFn', index, hasActivity, new Date().toISOString());
      activity.push({ index, hasActivity });
      yield;
    }

    console.log('returnHighestIndex', returnHighestIndex(activity), new Date().toISOString());
    return returnHighestIndex(activity);
  }

  const knownActivityAtIndex = await recurseUntilGeneratorDone(findHighestAddressIndexExponent());

  // this part seems to take ages
  async function* checkForMostRecentAccount() {
    const indexCounter = createCounter(knownActivityAtIndex + 1);
    const activity: AccountIndexActivityCheckHistory[] = [];

    while (
      minNumberOfAccountsNotChecked(activity.length) ||
      anyOfLastCheckedAccountsHaveActivity(activity)
    ) {
      const hasActivity = await doesAddressHaveActivityFn(indexCounter.getValue());
      activity.push({ index: indexCounter.getValue(), hasActivity });
      indexCounter.increment();
      console.log(
        'checkForMostRecentAccount',
        indexCounter.getValue(),
        hasActivity,
        new Date().toISOString()
      );
      yield;
    }
    console.log(
      'checkForMostRecentAccount indexCounter',
      returnHighestIndex(activity),
      new Date().toISOString()
    );

    return returnHighestIndex(activity);
  }
  return recurseUntilGeneratorDone(checkForMostRecentAccount());
}
