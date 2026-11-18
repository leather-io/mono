import { isPlainObject } from 'remeda';

export function isRecord(value: unknown) {
  return isPlainObject(value);
}
