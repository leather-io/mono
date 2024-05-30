import { isBoolean } from '@leather-wallet/utils';

export function propIfDefined(prop: string, value: any) {
  return isBoolean(value) ? { [prop]: value } : {};
}
