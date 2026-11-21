import { fields, numeral, prefixed } from '@leather.io/kernel';

export const descriptorKeyPath = prefixed(
  '/',
  fields('/', ['changeIndex', numeral(2, 1)], ['addressIndex', numeral(10)])
);
