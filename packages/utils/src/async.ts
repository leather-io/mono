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

export async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
}
