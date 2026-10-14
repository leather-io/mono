// TypeScript port of https://github.com/DavidWells/safe-await/
import { isError } from '@leather.io/utils';

// Native Error types https://mzl.la/2Veh3TR
const nativeExceptions = [
  EvalError,
  RangeError,
  ReferenceError,
  SyntaxError,
  TypeError,
  URIError,
].filter(except => typeof except === 'function');

function throwNative(error: unknown) {
  for (const Exception of nativeExceptions) {
    if (error instanceof Exception) throw error;
  }
}

// TODO: Migrate to `@leather.io/utils`
export async function safeAwait<T>(promise: Promise<T>, finallyFn?: () => void) {
  try {
    const data = await promise;
    if (isError(data)) {
      throwNative(data);
      const errorResult: readonly [Error] = [data];
      return errorResult;
    }
    return [undefined, data] as const;
  } catch (error) {
    throwNative(error);
    const errorResult: readonly [Error] = [isError(error) ? error : new Error(String(error))];
    return errorResult;
  } finally {
    if (finallyFn) finallyFn();
  }
}
