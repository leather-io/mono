import {
  compileWshDescriptor,
  getAddressFromOutScript,
  getBtcSignerLibNetworkConfigByMode,
} from '@leather.io/bitcoin';
import type { VaultAccount, VaultAccountSigner } from '@leather.io/models';

import { getMultisigDescriptor } from './btc-multisig-descriptor';

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
    userId: `user-${signerIndex}`,
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

// Real btc:mainnet 2-of-3 vault account, signing pubkeys at xpub `/0/1`.
const xpubSigners: { xpub: string; signingPubkey: string }[] = [
  {
    xpub: 'xpub6DFfyxrMEUfRArb44TcHbuHeGQ1qx3KWKsnykm6XMorKSWpCbnMESPHTZVPG3Tu4c7cdm1nPUxVB7214hkniqtYGYy2tXjP4unaobdPH3Wi',
    signingPubkey: '02f7dda37a7732eb2bb3d9f71a583f98ee1aae9c21783ee6e69994f0f1f6f376e7',
  },
  {
    xpub: 'xpub6DFfyxrMEUfR9Fyczq5xK1m8C3zKfi97mZDt3u4UnjjaWPW8q1PY4UogPFbdp4ibSDnmaHZrNCUYwmzj2GjBYVcaJMvniK2chBMqdbebH5f',
    signingPubkey: '031d1e0f56085a498534e1f02aed6ecbdb605e6d2541320801e7a92cac69b7c13d',
  },
  {
    xpub: 'xpub6DFfyxrMEUfRCQn3cPkudoGamQQZgExLUepcHduymGMBCBLEZgCoBXrjUWmzF74HXzPMYvsKdL25usDyKYV5PkHtYrM2oSg29j7wj4gu6vW',
    signingPubkey: '03cf080fa73f310555c4cf166395f9c224ea767abf41fc981600b06811dc7e52cb',
  },
];

describe(getMultisigDescriptor.name, () => {
  test('compiles to the same scriptPubKey regardless of signer order', () => {
    const forward = compileWshDescriptor(getMultisigDescriptor(makeAccount())).scriptPubKey;
    const reversed = compileWshDescriptor(
      getMultisigDescriptor(makeAccount({ signers: [...makeAccount().signers].reverse() }))
    ).scriptPubKey;
    expect(reversed).toEqual(forward);
  });

  test('emits a deterministic string with keys in signerIndex order, regardless of input order', () => {
    const expected = `wsh(sortedmulti(2,${publicKeys.join(',')}))`;
    const ordered = getMultisigDescriptor(makeAccount());
    const reversed = getMultisigDescriptor(
      makeAccount({ signers: [...makeAccount().signers].reverse() })
    );
    expect(ordered).toEqual(expected);
    expect(reversed).toEqual(expected);
  });

  test('expresses xpub signers as derivation paths that derive the vault address', () => {
    const account = makeAccount({
      threshold: 2,
      accountIndex: 1,
      multisigAddress: 'bc1qjnn26le9yyuf2h7gdn9jrxsjqnp9lze9t28er6a0k44dxu7ac7ysvtxart',
      signers: xpubSigners.map((signer, index) => ({
        ...makeSigner(index, signer.signingPubkey),
        xpub: signer.xpub,
        derivationIndex: 1,
      })),
    });

    const descriptor = getMultisigDescriptor(account);
    expect(descriptor).toContain(`${xpubSigners[0].xpub}/0/1`);

    const { scriptPubKey } = compileWshDescriptor(descriptor);
    const address = getAddressFromOutScript(
      scriptPubKey,
      getBtcSignerLibNetworkConfigByMode('mainnet')
    );
    expect(address).toEqual(account.multisigAddress);
  });
});
