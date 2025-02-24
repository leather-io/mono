import { isNumberOrNumberList, isUndefined } from '@leather.io/utils';

export function testIsNumberOrArrayOfNumbers(value: unknown) {
  if (isUndefined(value)) return true;
  return isNumberOrNumberList(value);
}
