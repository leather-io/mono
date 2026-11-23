import { characters, charactersExcept, fields, numeral } from '@leather.io/utils/kernel';

const fingerprintHexWidth = 8;

export const fingerprintHex = numeral(16, fingerprintHexWidth);
export const accountIdentifier = fields(
  '/',
  ['fingerprint', characters(charactersExcept('/'), { minLength: 1 })],
  ['accountIndex', numeral(10)]
);
