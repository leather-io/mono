import { stxGetAddresses } from './stx-get-addresses';

describe('stxGetAddresses', () => {
  const stxAddress = {
    symbol: 'STX',
    kind: 'single-sig',
    address: 'SP1P72Z370VRYK5V9V3YVQAS1Z4X6D6GKQJ8K2JGK',
    publicKey: '02d9b4b6e',
  };

  test('accepts a SIP-030 result with an addresses array', () => {
    expect(stxGetAddresses.result.safeParse({ addresses: [stxAddress] }).success).toEqual(true);
  });

  test('rejects a bare array result', () => {
    expect(stxGetAddresses.result.safeParse([stxAddress]).success).toEqual(false);
  });
});
