import {
  filterAccountsByFingerprint,
  findHighestAccountIndexOfFingerprint,
} from './bitcoin-state-helpers';

const fingerprintAlpha = 'deadbeef';
const fingerprintBeta = 'cafebabe';

const accounts = [
  { id: `${fingerprintAlpha}/86'/0'/0'` },
  { id: `${fingerprintAlpha}/86'/0'/1'` },
  { id: `${fingerprintAlpha}/86'/0'/2'` },
  { id: `${fingerprintAlpha}/86'/0'/3'` },
  { id: `${fingerprintBeta}/86'/0'/0'` },
  { id: `${fingerprintBeta}/86'/0'/1'` },
];

describe(filterAccountsByFingerprint.name, () => {
  test('that it filters accurately based on accounts input', () => {
    expect(accounts.filter(filterAccountsByFingerprint(fingerprintAlpha)).length).toEqual(4);
    expect(accounts.filter(filterAccountsByFingerprint(fingerprintBeta)).length).toEqual(2);
  });
});

describe(findHighestAccountIndexOfFingerprint.name, () => {
  test('that it finds the highest index of accounts provided', () => {
    // Cast array to map as data is kept in store
    const accountsMap = Object.fromEntries(accounts.map(account => [account.id, account]));

    expect(findHighestAccountIndexOfFingerprint(accountsMap, fingerprintAlpha)).toEqual(3);
    expect(findHighestAccountIndexOfFingerprint(accountsMap, fingerprintBeta)).toEqual(1);
  });
});
