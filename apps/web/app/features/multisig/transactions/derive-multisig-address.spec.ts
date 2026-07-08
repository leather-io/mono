import { describe, expect, test } from 'vitest';

import type { AuthNetworkId, VaultAccount, VaultAccountSigner } from '@leather.io/models';

import { deriveMultisigAddress } from './derive-multisig-address';

// Real 2-of-3 vault signers (xpub + signing pubkey pairs). The same witness program
// derives across networks, differing only in the bech32 prefix (bc1 / tb1 / bcrt1).
const xpubSigners = [
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

const mainnetAddress = 'bc1qjnn26le9yyuf2h7gdn9jrxsjqnp9lze9t28er6a0k44dxu7ac7ysvtxart';

function makeSigner(signerIndex: number): VaultAccountSigner {
  const { xpub, signingPubkey } = xpubSigners[signerIndex];
  return {
    network: 'btc:mainnet',
    publicKey: signingPubkey,
    address: 'bc1qmultisig',
    id: `signer-${signerIndex}`,
    userId: `user-${signerIndex}`,
    xpub,
    xpubOriginFingerprint: null,
    xpubOriginPath: null,
    signerIndex,
    signingPubkey,
  };
}

function makeAccount(network: AuthNetworkId): VaultAccount {
  return {
    id: 'va-1',
    vaultId: 'v-1',
    name: 'Test vault account',
    icon: null,
    network,
    threshold: 2,
    multisigAddress: '',
    accountIndex: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    signers: xpubSigners.map((_, index) => makeSigner(index)),
    pendingTransactionCount: 0,
    queuedTransactionCount: 0,
  };
}

describe('deriveMultisigAddress (BTC)', () => {
  test('derives a bc1 mainnet address for btc:mainnet', () => {
    expect(deriveMultisigAddress(makeAccount('btc:mainnet'))).toBe(mainnetAddress);
  });

  test('derives a tb1 testnet address for btc:testnet with no custom network', () => {
    expect(deriveMultisigAddress(makeAccount('btc:testnet')).startsWith('tb1')).toBe(true);
  });

  test('derives a bcrt1 regtest address for btc:regtest', () => {
    expect(deriveMultisigAddress(makeAccount('btc:regtest')).startsWith('bcrt1')).toBe(true);
  });
});
