import { compileWshDescriptor } from '@leather.io/bitcoin';
import type { VaultAccount, VaultAccountSigner } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import { buildUnsignedMultisigBtcTransfer, getMultisigDescriptor } from './build-btc-transfer';

const publicKeys = [
  '0250863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b2352',
  '03774ae7f858a9411e5ef4246b70c65aac5649980be5c17891bbec17895da008cb',
  '02f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9',
];

function makeSigner(signerIndex: number, signingPubkey: string): VaultAccountSigner {
  return {
    network: 'btc:mainnet',
    publicKey: signingPubkey,
    address: 'bc1qmultisig',
    id: `signer-${signerIndex}`,
    xpub: null,
    xpubOriginFingerprint: null,
    xpubOriginPath: null,
    signerIndex,
    signingPubkey,
    derivationIndex: null,
  };
}

function makeAccount(overrides: Partial<VaultAccount> = {}): VaultAccount {
  return {
    id: 'va-1',
    vaultId: 'v-1',
    name: 'Test vault account',
    icon: null,
    network: 'btc:mainnet',
    threshold: 2,
    multisigAddress: 'bc1qmultisig',
    accountIndex: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    signers: publicKeys.map((key, index) => makeSigner(index, key)),
    pendingTransactionCount: 0,
    queuedTransactionCount: 0,
    ...overrides,
  };
}

describe(getMultisigDescriptor.name, () => {
  test('compiles to the same scriptPubKey regardless of signer order', () => {
    const forward = compileWshDescriptor(getMultisigDescriptor(makeAccount())).scriptPubKey;
    const reversed = compileWshDescriptor(
      getMultisigDescriptor(makeAccount({ signers: [...makeAccount().signers].reverse() }))
    ).scriptPubKey;
    expect(reversed).toEqual(forward);
  });
});

describe(buildUnsignedMultisigBtcTransfer.name, () => {
  test('throws when the descriptor does not derive the vault address', async () => {
    await expect(
      buildUnsignedMultisigBtcTransfer({
        account: makeAccount({ multisigAddress: 'bc1qwrongaddress' }),
        recipient: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
        amount: createMoney(50000, 'BTC'),
        feeRate: 5,
      })
    ).rejects.toThrow('does not match vault address');
  });
});
