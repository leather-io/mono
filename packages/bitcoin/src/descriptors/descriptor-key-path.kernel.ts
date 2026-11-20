import { numeral, prefixed, splitAt } from '@leather.io/kernel';

export const descriptorKeyPath = prefixed('/', splitAt('/', numeral(10), numeral(10)));
