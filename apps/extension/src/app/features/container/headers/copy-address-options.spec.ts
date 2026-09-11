import type { AccountAddresses } from '@leather.io/models';

import { createCopyAddressOptions } from './copy-address-options';

const accountId = { accountIndex: 0, fingerprint: 'test-fingerprint' };

describe(createCopyAddressOptions.name, () => {
  test('returns all available single-sig address formats and recommends Native SegWit', () => {
    const account: AccountAddresses = {
      id: accountId,
      bitcoin: {
        type: 'hd',
        nativeSegwitDescriptor: 'wpkh(xpub)',
        taprootDescriptor: 'tr(xpub)',
        zeroIndexNativeSegwitPayerAddress: 'bc1q-native-segwit-address',
        zeroIndexTaprootPayerAddress: 'bc1p-taproot-address',
      },
      stacks: { stxAddress: 'SP-stacks-address' },
    };

    const options = createCopyAddressOptions(account);

    expect(
      options.map(({ id, recommended }) => ({ id, recommended: Boolean(recommended) }))
    ).toEqual([
      { id: 'btc-native-segwit', recommended: true },
      { id: 'btc-taproot', recommended: false },
      { id: 'stx', recommended: false },
    ]);
  });

  test('only returns address formats available to the active account', () => {
    const options = createCopyAddressOptions({
      id: accountId,
      stacks: { stxAddress: 'SP-stacks-address' },
    });

    expect(options.map(option => option.id)).toEqual(['stx']);
  });

  test('uses the selected policy address instead of unrelated single-sig addresses', () => {
    const options = createCopyAddressOptions({
      id: accountId,
      bitcoin: {
        address: 'bc1q-policy-address',
        multisig: { signerCount: 2, threshold: 2 },
        paymentType: 'p2wsh',
        type: 'fixedAddress',
      },
    });

    expect(options).toEqual([
      {
        address: 'bc1q-policy-address',
        chain: 'bitcoin',
        format: 'Policy address',
        id: 'btc-policy',
        title: 'Bitcoin',
      },
    ]);
  });

  test('uses the selected Stacks policy address', () => {
    const options = createCopyAddressOptions({
      id: accountId,
      stacks: { stxAddress: 'SP-policy-address' },
    });

    expect(options).toEqual([
      {
        address: 'SP-policy-address',
        chain: 'stacks',
        format: 'STX',
        id: 'stx',
        title: 'Stacks',
      },
    ]);
  });
});
