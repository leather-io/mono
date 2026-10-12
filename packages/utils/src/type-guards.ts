export function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

export function isBigInt(value: unknown): value is bigint {
  return typeof value === 'bigint';
}

export function isUndefined(value: unknown): value is undefined {
  return typeof value === 'undefined';
}

export function isObject(value: unknown): value is object {
  return typeof value === 'object';
}
