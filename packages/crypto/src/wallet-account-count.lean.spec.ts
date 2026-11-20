import fc from 'fast-check';
import { describe, test } from 'vitest';

import {
  encodeText,
  expectAgreementWithLeanModel,
  leanCall,
  leanOracleAvailable,
  observeValue,
} from './proofs/lean-oracle';
import {
  countWalletAccounts,
  isValidAccountIndex,
  softwareAccountCountFromHighestIndex,
} from './wallet-account-count';

const walletFingerprint = 'e5f6a7b8';

function encodeIndexInput(index: number | undefined): string {
  return index !== undefined && Number.isSafeInteger(index) && index >= 0 ? String(index) : 'other';
}

const indexInputArbitrary = fc.oneof(
  fc.nat(),
  fc.maxSafeNat(),
  fc.double().filter(value => !Number.isInteger(value) || Number.isSafeInteger(value)),
  fc.constantFrom(
    undefined,
    0,
    -0,
    1,
    -1,
    1.5,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.MAX_SAFE_INTEGER,
    Number.MIN_SAFE_INTEGER
  )
);

const fingerprintArbitrary = fc.constantFrom(walletFingerprint, 'deadbeef', 'E5F6A7B8', '');

const accountSegmentArbitrary = fc.oneof(
  fc.nat({ max: 4 }).map(index => `${index}'`),
  fc.nat({ max: 4 }).map(String),
  fc.constantFrom('', "'", 'abc', '1x', '-1', '9007199254740992')
);

const descriptorArbitrary = fc.oneof(
  fc
    .tuple(fingerprintArbitrary, accountSegmentArbitrary, fc.constantFrom('xpub', 'pub', ''))
    .map(([fingerprint, account, key]) => `[${fingerprint}/84'/0'/${account}]${key}`),
  fc
    .tuple(fingerprintArbitrary, accountSegmentArbitrary)
    .map(([fingerprint, account]) => `[${fingerprint}/5757'/0'/0'/0/${account}]pub`),
  fc.constantFrom(
    '',
    'not-a-descriptor',
    `[${walletFingerprint}/84']xpub`,
    `${walletFingerprint}/84'/0'/0'`
  ),
  fc.string({ maxLength: 10 })
);

const keychainArbitrary = fc.record({
  descriptor: descriptorArbitrary,
  chain: fc.constantFrom<'bitcoin' | 'stacks'>('bitcoin', 'stacks'),
});

const countArgsArbitrary = fc.record({
  walletType: fc.constantFrom('software', 'ledger', 'keystone', ''),
  fingerprint: fingerprintArbitrary,
  highestAccountIndex: indexInputArbitrary,
  keychains: fc.array(keychainArbitrary, { maxLength: 8 }),
});

describe.skipIf(!leanOracleAvailable)('Lean model of wallet-account-count', () => {
  test('isValidAccountIndex agrees with the model', () => {
    expectAgreementWithLeanModel(
      indexInputArbitrary,
      index => ({
        call: leanCall('isValidAccountIndex', encodeIndexInput(index)),
        observed: observeValue(() => isValidAccountIndex(index)),
      }),
      { minimumSupportedShare: 1 }
    );
  });

  test('softwareAccountCountFromHighestIndex agrees with the model', () => {
    expectAgreementWithLeanModel(
      indexInputArbitrary,
      index => ({
        call: leanCall('softwareAccountCountFromHighestIndex', encodeIndexInput(index)),
        observed: observeValue(() => softwareAccountCountFromHighestIndex(index)),
      }),
      { minimumSupportedShare: 1 }
    );
  });

  test('countWalletAccounts agrees with the model', () => {
    expectAgreementWithLeanModel(countArgsArbitrary, args => ({
      call: leanCall(
        'countWalletAccounts',
        encodeText(args.walletType),
        encodeText(args.fingerprint),
        encodeIndexInput(args.highestAccountIndex),
        ...args.keychains.flatMap(({ descriptor, chain }) => [
          encodeText(descriptor),
          encodeText(chain),
        ])
      ),
      observed: observeValue(() => countWalletAccounts(args)),
    }));
  });
});
