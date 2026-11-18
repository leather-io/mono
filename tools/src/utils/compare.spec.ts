import { describe, expect, test } from 'vitest';

import { compareStrings } from './compare.js';

describe(compareStrings.name, () => {
  test('orders by code point regardless of the process locale', () => {
    expect(['hat', 'chalk', 'B', 'a'].sort(compareStrings)).toEqual(['B', 'a', 'chalk', 'hat']);
    expect(compareStrings('send-btc-choose-fee', 'send-btc-confirmation')).toBeLessThan(0);
    expect(compareStrings('same', 'same')).toBe(0);
  });
});
