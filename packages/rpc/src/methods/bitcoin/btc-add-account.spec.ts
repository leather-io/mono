import { btcAddAccount } from './btc-add-account';

describe('btcAddAccount', () => {
  const validParams = {
    descriptor:
      'wsh(sortedmulti(2,[fp/48h/0h/0h/2h]xpubA/0/*,[fp2/48h/0h/0h/2h]xpubB/0/*))#checksum',
    name: 'Treasury vault',
  };

  test('accepts a valid descriptor and name', () => {
    expect(btcAddAccount.params.safeParse(validParams).success).toEqual(true);
  });

  test('accepts an optional network', () => {
    expect(btcAddAccount.params.safeParse({ ...validParams, network: 'testnet' }).success).toEqual(
      true
    );
  });

  test('rejects a missing descriptor', () => {
    expect(btcAddAccount.params.safeParse({ name: 'Treasury vault' }).success).toEqual(false);
  });

  test('rejects a missing name', () => {
    expect(btcAddAccount.params.safeParse({ descriptor: validParams.descriptor }).success).toEqual(
      false
    );
  });

  test('result schema matches expected shape', () => {
    const result = btcAddAccount.result.safeParse({
      address: 'bc1qexampleaddress',
      descriptor: validParams.descriptor,
      accountId: 'account-id',
      role: 'signer',
    });
    expect(result.success).toEqual(true);
  });

  test('result schema rejects an unknown role', () => {
    const result = btcAddAccount.result.safeParse({
      address: 'bc1qexampleaddress',
      descriptor: validParams.descriptor,
      accountId: 'account-id',
      role: 'owner',
    });
    expect(result.success).toEqual(false);
  });
});
