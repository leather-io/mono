export const animationMaxAttempts = 3;
export const animationRetryDelayMs = 500;
export const animationLoadTimeoutMs = 12000;

function waitForRetry(delay: number, signal: AbortSignal) {
  return new Promise<void>(resolve => {
    function finish() {
      clearTimeout(timer);
      signal.removeEventListener('abort', finish);
      resolve();
    }
    const timer = setTimeout(finish, delay);
    signal.addEventListener('abort', finish, { once: true });
    if (signal.aborted) finish();
  });
}

export async function loadAnimationWithRetry<T>(
  load: (signal: AbortSignal) => Promise<T | null>,
  signal: AbortSignal
): Promise<T | null> {
  for (let attempt = 0; attempt < animationMaxAttempts && !signal.aborted; attempt += 1) {
    const controller = new AbortController();
    function cancel() {
      controller.abort();
    }
    signal.addEventListener('abort', cancel, { once: true });
    const timer = setTimeout(cancel, animationLoadTimeoutMs);
    const cancelled = new Promise<null>(resolve => {
      controller.signal.addEventListener('abort', () => resolve(null), { once: true });
    });
    try {
      const result = await Promise.race([load(controller.signal), cancelled]);
      if (result !== null && !controller.signal.aborted) return result;
    } catch {
      controller.abort();
    } finally {
      clearTimeout(timer);
      signal.removeEventListener('abort', cancel);
      controller.abort();
    }
    if (attempt < animationMaxAttempts - 1 && !signal.aborted) {
      await waitForRetry(animationRetryDelayMs * (attempt + 1), signal);
    }
  }
  return null;
}
