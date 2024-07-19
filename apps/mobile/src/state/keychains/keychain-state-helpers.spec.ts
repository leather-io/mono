import {
  filterKeychainsByAccountIndex,
  filterKeychainsByFingerprint,
  findHighestAccountIndexOfFingerprint,
} from './keychain-state-helpers';

const fingerprintAlpha = 'deadbeef';
const fingerprintBeta = 'cafebabe';

const accounts = [
  { descriptor: `${fingerprintAlpha}/86'/0'/0'` },
  { descriptor: `${fingerprintAlpha}/86'/0'/1'` },
  { descriptor: `${fingerprintAlpha}/86'/0'/2'` },
  { descriptor: `${fingerprintAlpha}/86'/0'/3'` },
  { descriptor: `${fingerprintBeta}/86'/0'/0'` },
  { descriptor: `${fingerprintBeta}/86'/0'/1'` },
];

describe(filterKeychainsByFingerprint.name, () => {
  test('that it filters accounts by given fingerprint', () => {
    expect(accounts.filter(filterKeychainsByFingerprint(fingerprintAlpha)).length).toEqual(4);
    expect(accounts.filter(filterKeychainsByFingerprint(fingerprintBeta)).length).toEqual(2);
  });
});

describe(filterKeychainsByAccountIndex.name, () => {
  test('that it filters accounts by given account index', () => {
    expect(accounts.filter(filterKeychainsByAccountIndex(0)).length).toEqual(2);
    expect(accounts.filter(filterKeychainsByAccountIndex(1)).length).toEqual(2);
    expect(accounts.filter(filterKeychainsByAccountIndex(2)).length).toEqual(1);
    expect(accounts.filter(filterKeychainsByAccountIndex(3)).length).toEqual(1);
  });
});

describe(findHighestAccountIndexOfFingerprint.name, () => {
  test('that it finds the highest index of accounts provided', () => {
    expect(findHighestAccountIndexOfFingerprint(accounts, fingerprintAlpha)).toEqual(3);
    expect(findHighestAccountIndexOfFingerprint(accounts, fingerprintBeta)).toEqual(1);
  });
});
