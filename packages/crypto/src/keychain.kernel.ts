import { characters, charactersExcept, numeral, splitAt } from '@leather.io/kernel';

const fingerprintHexWidth = 8;

export const fingerprintHex = numeral(16, fingerprintHexWidth);
export const accountIdentifier = splitAt(
  '/',
  characters(charactersExcept('/'), { minLength: 1 }),
  numeral(10)
);
