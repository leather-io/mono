import { delay } from '@leather.io/utils';

export function ensureAsyncFunctionMinimumDuration<Args extends unknown[], Result>(
  fn: (...args: Args) => Promise<Result>,
  minimumDuration: number
) {
  return async (...args: Args): Promise<Result> => {
    const resultPromise = fn(...args);
    const delayPromise = delay(minimumDuration);

    await Promise.allSettled([resultPromise, delayPromise]);

    return resultPromise;
  };
}
