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
  fromAccountIndex?: number;
  onActivityFound?(highestAccountIndex: number): Promise<void> | void;
}

export async function recurseAccountsForActivity({
  doesAddressHaveActivityFn,
  fromAccountIndex = 0,
  onActivityFound,
}: RecurseAccountsForActivityArgs): Promise<number> {
  const knownActivityFloor = Math.max(0, fromAccountIndex);
  let highestActivityIndex = knownActivityFloor;

  async function reportProgress(activity: AccountIndexActivityCheckHistory[]) {
    const highest = returnHighestIndex(activity);
    if (highest > highestActivityIndex) {
      highestActivityIndex = highest;
      await onActivityFound?.(highestActivityIndex);
    }
  }

  async function* findHighestAddressIndexExponent() {
    const fibonacci = fibonacciGenerator(2);
    const activity: AccountIndexActivityCheckHistory[] = [];
    const batchSize = 5;

    while (!activity.length || activity[activity.length - 1].hasActivity) {
      const indices: number[] = [];
      for (let i = 0; i < batchSize; i++) {
        const nextResult = fibonacci.next();
        if (nextResult.done) break;
        indices.push(knownActivityFloor + nextResult.value);
      }
      if (!indices.length) break;
      const results = await Promise.all(
        indices.map(async index => {
          const hasActivity = await doesAddressHaveActivityFn(index);
          return { index, hasActivity };
        })
      );
      activity.push(...results);
      await reportProgress(activity);
      yield;
    }
    return returnHighestIndex(activity);
  }

  const knownActivityAtIndex = Math.max(
    knownActivityFloor,
    await recurseUntilGeneratorDone(findHighestAddressIndexExponent())
  );

  async function* checkForMostRecentAccount() {
    const indexCounter = createCounter(knownActivityAtIndex + 1);
    const activity: AccountIndexActivityCheckHistory[] = [];
    const batchSize = 5;

    while (
      minNumberOfAccountsNotChecked(activity.length) ||
      anyOfLastCheckedAccountsHaveActivity(activity)
    ) {
      const indices: number[] = [];
      for (let i = 0; i < batchSize; i++) {
        indices.push(indexCounter.getValue());
        indexCounter.increment();
      }
      const results = await Promise.all(
        indices.map(async index => {
          const hasActivity = await doesAddressHaveActivityFn(index);
          return { index, hasActivity };
        })
      );
      activity.push(...results);
      await reportProgress(activity);
      yield;
    }
    return returnHighestIndex(activity);
  }

  return Math.max(
    knownActivityAtIndex,
    await recurseUntilGeneratorDone(checkForMostRecentAccount())
  );
}
