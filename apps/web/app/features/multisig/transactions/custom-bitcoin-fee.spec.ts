import { describe, expect, test } from 'vitest';

import { parseCustomBitcoinFeeRate } from './custom-bitcoin-fee';

describe(parseCustomBitcoinFeeRate.name, () => {
  test.each(['1', '1.25', '0.1', ' 20.5 '])('accepts positive decimal rate %j', input => {
    expect(parseCustomBitcoinFeeRate(input)).toBe(Number(input));
  });

  test.each(['', ' ', '0', '-1', 'Infinity', 'NaN', '1e2', '0x10', '1,5', '9007199254740992'])(
    'rejects invalid rate %j',
    input => {
      expect(parseCustomBitcoinFeeRate(input)).toBeUndefined();
    }
  );
});
