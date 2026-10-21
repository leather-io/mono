export function isNumber(value: unknown) {
  return typeof value === 'number';
}

export function isBigInt(value: unknown) {
  return typeof value === 'bigint';
}

export function isUndefined(value: unknown) {
  return typeof value === 'undefined';
}

export function isObject(value: unknown) {
  return typeof value === 'object';
}
