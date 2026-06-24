import { stxAddAccount } from './stx-add-account';

const pubkeyA = `02${'a'.repeat(64)}`;
const pubkeyB = `03${'b'.repeat(64)}`;
const pubkeyC = `02${'c'.repeat(64)}`;

describe('stxAddAccount', () => {
  const validParams = {
    publicKeys: [pubkeyA, pubkeyB, pubkeyC],
    threshold: 2,
    name: 'Treasury vault',
  };

  test('accepts a valid multisig payload', () => {
    expect(stxAddAccount.params.safeParse(validParams).success).toEqual(true);
  });

  test('accepts an optional network', () => {
    expect(stxAddAccount.params.safeParse({ ...validParams, network: 'testnet' }).success).toEqual(
      true
    );
  });

  test('rejects a single public key (multisig only)', () => {
    expect(
      stxAddAccount.params.safeParse({ ...validParams, publicKeys: [pubkeyA], threshold: 1 })
        .success
    ).toEqual(false);
  });

  test('rejects a threshold greater than the number of public keys', () => {
    expect(stxAddAccount.params.safeParse({ ...validParams, threshold: 4 }).success).toEqual(false);
  });

  test('rejects a threshold below 1', () => {
    expect(stxAddAccount.params.safeParse({ ...validParams, threshold: 0 }).success).toEqual(false);
  });

  test('rejects a malformed public key', () => {
    expect(
      stxAddAccount.params.safeParse({ ...validParams, publicKeys: [pubkeyA, 'not-a-pubkey'] })
        .success
    ).toEqual(false);
  });
});
