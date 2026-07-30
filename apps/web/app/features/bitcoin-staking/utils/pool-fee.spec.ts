import { intCV, uintCV } from '@stacks/transactions';

import { decodeFeeBips, formatFeeBips } from './pool-fee';

const maxFeeBips = 10_000;

describe(decodeFeeBips.name, () => {
  test('decodes a rate', () => {
    expect(decodeFeeBips(uintCV(500))).toEqual(500);
  });

  test('decodes a zero rate', () => {
    expect(decodeFeeBips(uintCV(0))).toEqual(0);
  });

  test('is null for a non-uint value', () => {
    expect(decodeFeeBips(intCV(500))).toBeNull();
  });

  test('is null for a rate the contract could not have accepted', () => {
    expect(decodeFeeBips(uintCV(maxFeeBips))).toBeNull();
  });
});

describe(formatFeeBips.name, () => {
  test.each([
    [0, '0%'],
    [500, '5%'],
    [550, '5.5%'],
    [525, '5.25%'],
    [9999, '99.99%'],
  ])('formats %i bips as %s', (bips, expected) => {
    expect(formatFeeBips(bips)).toEqual(expected);
  });
});
