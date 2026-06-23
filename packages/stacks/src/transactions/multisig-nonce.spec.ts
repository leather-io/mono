import { hexToBytes } from '@noble/hashes/utils';
import { deserializeTransaction } from '@stacks/transactions';

import { substituteStxNonce } from './multisig-nonce';

// A real proposed stx:mainnet 2-of-3 multisig STX transfer (StandardAuth,
// P2SHNonSequential), placeholder nonce 0.
const realPayload =
  '00000000010405bf753763204843631823bc99674208cdc5a8734600000000000000000000000000000308000000000002030200000000000516f4b1aa40ed3e9c9990f099736006887e66cae1cc00000000003d090000000000000000000000000000000000000000000000000000000000000000000000';

// Nonce field sits at offset 27 (7 + 20-byte P2SH signer hash), 8 bytes long.
const nonceStart = 27;
const nonceEnd = 35;

describe(substituteStxNonce.name, () => {
  test('matches deserialize/setNonce/reserialize for a real P2SHNonSequential tx', () => {
    const nonce = 42;
    const tx = deserializeTransaction(realPayload);
    tx.setNonce(nonce);
    expect(substituteStxNonce(realPayload, nonce)).toEqual(tx.serialize());
  });

  test('is a no-op when substituting the existing nonce', () => {
    expect(substituteStxNonce(realPayload, 0)).toEqual(realPayload);
  });

  test('overwrites only the 8-byte nonce field at the computed offset', () => {
    const before = hexToBytes(realPayload);
    const after = hexToBytes(substituteStxNonce(realPayload, 123456));

    for (let i = 0; i < before.length; i++) {
      if (i >= nonceStart && i < nonceEnd) continue;
      expect(after[i]).toEqual(before[i]);
    }
    // 123456 === 0x0001e240, big-endian over 8 bytes.
    expect([...after.slice(nonceStart, nonceEnd)]).toEqual([0, 0, 0, 0, 0, 1, 0xe2, 0x40]);
  });

  test('rejects an unsupported hash mode', () => {
    const tampered = `${realPayload.slice(0, 12)}00${realPayload.slice(14)}`;
    expect(() => substituteStxNonce(tampered, 1)).toThrow('hash mode');
  });

  test('rejects sponsored auth', () => {
    const tampered = `${realPayload.slice(0, 10)}05${realPayload.slice(12)}`;
    expect(() => substituteStxNonce(tampered, 1)).toThrow('auth type');
  });
});
