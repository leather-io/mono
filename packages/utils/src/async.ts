export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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
