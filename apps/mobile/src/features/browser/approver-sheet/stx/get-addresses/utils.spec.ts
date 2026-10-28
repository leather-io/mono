import { describe, expect, test } from 'vitest';

import { formatAddressesForStxGetAddresses } from './utils';

describe(formatAddressesForStxGetAddresses.name, () => {
  const account = {
    address: 'SP1P72Z370VRYK5V9V3YVQAS1Z4X6D6GKQJ8K2JGK',
    publicKey: new Uint8Array([2, 217, 180, 182]),
  };

  test('wraps the address in an addresses array, as SIP-030 specifies', () => {
    expect(formatAddressesForStxGetAddresses(account)).toEqual({
      addresses: [
        {
          symbol: 'STX',
          kind: 'single-sig',
          address: 'SP1P72Z370VRYK5V9V3YVQAS1Z4X6D6GKQJ8K2JGK',
          publicKey: '02d9b4b6',
        },
      ],
    });
  });
});
