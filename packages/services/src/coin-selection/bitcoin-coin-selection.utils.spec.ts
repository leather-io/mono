import { AccountAddresses } from '@leather.io/models';

import { getInputSizing } from './bitcoin-coin-selection.utils';

const id = { fingerprint: 'fp', accountIndex: 0 };

describe(getInputSizing.name, () => {
  test('derives the p2wsh sizing spec from a fixed-address multisig account', () => {
    const account: AccountAddresses = {
      id,
      bitcoin: {
        type: 'fixedAddress',
        address: 'bc1qmultisig',
        paymentType: 'p2wsh',
        multisig: { threshold: 2, signerCount: 3 },
      },
    };

    expect(getInputSizing(account)).toEqual({
      paymentType: 'p2wsh',
      threshold: 2,
      signerCount: 3,
    });
  });

  test('returns undefined for an hd bitcoin account', () => {
    const account: AccountAddresses = {
      id,
      bitcoin: {
        type: 'hd',
        taprootDescriptor: 'tr(...)',
        nativeSegwitDescriptor: 'wpkh(...)',
      },
    };

    expect(getInputSizing(account)).toBeUndefined();
  });

  test('returns undefined when the account has no bitcoin address', () => {
    expect(getInputSizing({ id })).toBeUndefined();
  });
});
