import { intCV, tupleCV, uintCV } from '@stacks/transactions';

import { decodeFeeBips, decodePendingFees, formatFeeBips, getExpectedFeeBips } from './pool-fee';

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

describe(decodePendingFees.name, () => {
  test('decodes a queued fee increase', () => {
    const value = tupleCV({
      'active-bips': uintCV(0),
      'pending-bips': uintCV(450),
      'activation-cycle': uintCV(142),
    });
    expect(decodePendingFees(value)).toEqual({
      activeFeeBips: 0,
      pendingFeeBips: 450,
      pendingActivationCycle: 142,
    });
  });

  test('reports no pending change when the rates match', () => {
    const value = tupleCV({
      'active-bips': uintCV(450),
      'pending-bips': uintCV(450),
      'activation-cycle': uintCV(120),
    });
    expect(decodePendingFees(value)).toEqual({
      activeFeeBips: 450,
      pendingFeeBips: null,
      pendingActivationCycle: null,
    });
  });

  test('is null for a non-tuple value', () => {
    expect(decodePendingFees(uintCV(450))).toBeNull();
  });

  test('is null when the active rate is invalid', () => {
    const value = tupleCV({
      'active-bips': uintCV(maxFeeBips),
      'pending-bips': uintCV(450),
      'activation-cycle': uintCV(142),
    });
    expect(decodePendingFees(value)).toBeNull();
  });

  test('falls back to the active rate when the pending rate is invalid', () => {
    const value = tupleCV({
      'active-bips': uintCV(300),
      'pending-bips': intCV(450),
      'activation-cycle': uintCV(142),
    });
    expect(decodePendingFees(value)).toEqual({
      activeFeeBips: 300,
      pendingFeeBips: null,
      pendingActivationCycle: null,
    });
  });
});

describe(getExpectedFeeBips.name, () => {
  test('prefers the pending rate when a change is queued', () => {
    expect(
      getExpectedFeeBips({ activeFeeBips: 0, pendingFeeBips: 450, pendingActivationCycle: 142 })
    ).toEqual(450);
  });

  test('uses the active rate when no change is queued', () => {
    expect(
      getExpectedFeeBips({ activeFeeBips: 300, pendingFeeBips: null, pendingActivationCycle: null })
    ).toEqual(300);
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
