import { privateKeyToPublic, stringAsciiCV } from '@stacks/transactions';

import { computeProposalHash, decodeProposalPayload } from '@leather.io/crypto';
import type { MultisigTransaction, VaultAccount, VaultAccountSigner } from '@leather.io/models';
import { signStructuredDataMessage } from '@leather.io/stacks';

import { deriveMultisigAddress } from '../derive-multisig-address';
import { buildStxProposalDomain } from '../stx-proposal-domain';
import { preSignVerification } from './pre-sign-verification';

const proposerUserId = '5ac53c09-7d42-4d0b-876f-15ef03b0ece5';

// Real btc:mainnet 2-of-3 vault account; the proposer is signerIndex 1.
const account: VaultAccount = {
  id: '4225f751-64ef-4dad-b7cf-135c2010c0de',
  vaultId: '799370f8-fec4-44bb-ba65-7df888f57c5f',
  name: 'BTC 2of3',
  icon: 'piggybank',
  network: 'btc:mainnet',
  threshold: 2,
  multisigAddress: 'bc1qjnn26le9yyuf2h7gdn9jrxsjqnp9lze9t28er6a0k44dxu7ac7ysvtxart',
  accountIndex: 1,
  createdAt: '2026-06-22T09:04:15.571Z',
  signers: [
    {
      network: 'btc:mainnet',
      publicKey: '02e50bdeee4839821db5258002f5035f29d9ae908dc363052ddd1bb1399fd65a18',
      address: 'bc1q3gxpkrm4hnyvrf6x47vva2y64srpq8l220r79f',
      id: '2bc9da20-5a5b-4a84-ac2c-cd6c17099e5c',
      userId: 'user-0',
      xpub: 'xpub6DFfyxrMEUfRArb44TcHbuHeGQ1qx3KWKsnykm6XMorKSWpCbnMESPHTZVPG3Tu4c7cdm1nPUxVB7214hkniqtYGYy2tXjP4unaobdPH3Wi',
      xpubOriginFingerprint: 'd34db33f',
      xpubOriginPath: "m/84'/0'/1'",
      signerIndex: 0,
      signingPubkey: '02f7dda37a7732eb2bb3d9f71a583f98ee1aae9c21783ee6e69994f0f1f6f376e7',
    },
    {
      network: 'btc:mainnet',
      publicKey: '021a1fdf4bd7dd52d5e672c123e35936def2b7e9f5ff454d3e3f658406a0b39c1e',
      address: 'bc1qwfnhmwpth429l7xmgnej2gdx2frlpe8s28qc4c',
      id: '5ac53c09-7d42-4d0b-876f-15ef03b0ece5',
      userId: proposerUserId,
      xpub: 'xpub6DFfyxrMEUfR9Fyczq5xK1m8C3zKfi97mZDt3u4UnjjaWPW8q1PY4UogPFbdp4ibSDnmaHZrNCUYwmzj2GjBYVcaJMvniK2chBMqdbebH5f',
      xpubOriginFingerprint: 'd34db33f',
      xpubOriginPath: "m/84'/0'/0'",
      signerIndex: 1,
      signingPubkey: '031d1e0f56085a498534e1f02aed6ecbdb605e6d2541320801e7a92cac69b7c13d',
    },
    {
      network: 'btc:mainnet',
      publicKey: '03595b245a5252c15782eccdea7113f3c85ff999f22fa98eff6c4feea7c75926ae',
      address: 'bc1qf5akdpz0fcagmfzu9s2yj0xj4yyem23pd9h7cz',
      id: '6d497227-c87a-40e1-8cf1-6f67ff3e6254',
      userId: 'user-2',
      xpub: 'xpub6DFfyxrMEUfRCQn3cPkudoGamQQZgExLUepcHduymGMBCBLEZgCoBXrjUWmzF74HXzPMYvsKdL25usDyKYV5PkHtYrM2oSg29j7wj4gu6vW',
      xpubOriginFingerprint: 'd34db33f',
      xpubOriginPath: "m/84'/0'/2'",
      signerIndex: 2,
      signingPubkey: '03cf080fa73f310555c4cf166395f9c224ea767abf41fc981600b06811dc7e52cb',
    },
  ],
  pendingTransactionCount: 0,
  queuedTransactionCount: 0,
};

// The real proposed transaction signerIndex 1 committed to.
const transaction: MultisigTransaction = {
  id: '2308ac7b-a51f-4487-a4e8-6ddd698f46c2',
  vaultAccountId: account.id,
  network: 'btc:mainnet',
  proposerUserId,
  proposalRawPayload:
    'cHNidP8BAH0CAAAAAcKXI0jnXNhAEdAtv1EYGT4nlsrmhISKxj9TMyDxAYpjAAAAAAD/////AhAnAAAAAAAAFgAUcmd9uCu9VF/420TzJSGmUkfw5PBKDgAAAAAAACIAIJTmrX8lITiVX8hsyyGaEgTCX4slWo+R66+1atNz3ceJAAAAAAABASuwNgAAAAAAACIAIJTmrX8lITiVX8hsyyGaEgTCX4slWo+R66+1atNz3ceJAQVpUiEC992jency6yuz2fcaWD+Y7hqunCF4PubmmZTw8fbzduchAx0eD1YIWkmFNOHwKu1uy9tgXm0lQTIIAeepLKxpt8E9IQPPCA+nPzEFVcTPFmOV+cIk6nZ6v0H8mBYAsGgR3H5Sy1OuAAAA',
  proposalSignature:
    'AkcwRAIgRTAdNyEvAfMOaqH6zK6FLmGgu1Oj3fXbhOAyI+JCf5sCIDq0P71sF67OvpdQ5BDSPq9xji3anjrprzy7G7nrDV9QASECGh/fS9fdUtXmcsEj41k23vK36fX/RU0+P2WEBqCznB4=',
  proposalTimestamp: 1782140665,
  proposalHash: '2e44a0213859a47c604f8e1bcf1e6110ee4868f4bc20cda25800ad77962372e1',
  nonce: null,
  txId: null,
  status: 'pending',
  signatures: [],
  broadcastAt: null,
  createdAt: '2026-06-22T15:04:27.566Z',
  updatedAt: '2026-06-22T15:04:27.566Z',
};

describe(preSignVerification.name, () => {
  test('passes for a genuine proposal + vault', () => {
    expect(() => preSignVerification({ transaction, account })).not.toThrow();
  });

  test('rejects a single-character change to the proposal payload', () => {
    const i = 40;
    const original = transaction.proposalRawPayload[i];
    const flipped = original === 'A' ? 'B' : 'A';
    const proposalRawPayload =
      transaction.proposalRawPayload.slice(0, i) +
      flipped +
      transaction.proposalRawPayload.slice(i + 1);
    expect(() =>
      preSignVerification({ transaction: { ...transaction, proposalRawPayload }, account })
    ).toThrow();
  });

  test('rejects a tampered proposal timestamp at the commitment check', () => {
    expect(() =>
      preSignVerification({
        transaction: { ...transaction, proposalTimestamp: transaction.proposalTimestamp + 1 },
        account,
      })
    ).toThrow(/commitment/i);
  });

  test('rejects a tampered multisig address at the address check', () => {
    expect(() =>
      preSignVerification({
        transaction,
        account: { ...account, multisigAddress: 'bc1qf5akdpz0fcagmfzu9s2yj0xj4yyem23pd9h7cz' },
      })
    ).toThrow(/Signer set tampered/i);
  });

  test('rejects a tampered threshold at the address check', () => {
    expect(() =>
      preSignVerification({ transaction, account: { ...account, threshold: 3 } })
    ).toThrow(/Signer set tampered/i);
  });

  test('rejects a proposer whose signing key does not derive from its xpub', () => {
    const signers = account.signers.map(signer =>
      signer.userId === proposerUserId
        ? {
            ...signer,
            signingPubkey: '02f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9',
          }
        : signer
    );
    expect(() => preSignVerification({ transaction, account: { ...account, signers } })).toThrow(
      /derive from the same xpub/i
    );
  });

  test('rejects a BTC proposer missing its xpub', () => {
    const signers = account.signers.map(signer =>
      signer.userId === proposerUserId ? { ...signer, xpub: null } : signer
    );
    expect(() => preSignVerification({ transaction, account: { ...account, signers } })).toThrow(
      /missing its xpub/i
    );
  });

  test('rejects a proposer that is not a signer on the account', () => {
    expect(() =>
      preSignVerification({
        transaction: { ...transaction, proposerUserId: 'cafe0000-0000-0000-0000-000000000000' },
        account,
      })
    ).toThrow(/not a signer/i);
  });

  test('verifies against the identity pubkey, not the served address', () => {
    // The served `address` is no longer trusted: swapping it to another address has
    // no effect, because verification re-derives the address from the bound publicKey.
    const signers = account.signers.map(signer =>
      signer.userId === proposerUserId
        ? { ...signer, address: 'bc1q3gxpkrm4hnyvrf6x47vva2y64srpq8l220r79f' }
        : signer
    );
    expect(() =>
      preSignVerification({ transaction, account: { ...account, signers } })
    ).not.toThrow();
  });
});

function stxPublicKeyHex(privateKey: string): string {
  const publicKey = privateKeyToPublic(privateKey);
  if (typeof publicKey !== 'string') throw new Error('Expected a compressed hex public key');
  return publicKey;
}

// Synthetic but cryptographically valid STX 2-of-3 vault: known signer keys derive
// the multisig address, and the proposer signs a real SIP-018 commitment.
// preSignVerification never parses the payload — it only hashes and verifies it —
// so the payload bytes need only be consistent with the signature, not a real tx.
const stxPrivateKeys = [
  '753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601',
  '2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c01',
  '5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d01',
];

const stxSigners: VaultAccountSigner[] = stxPrivateKeys.map((privateKey, index) => {
  const publicKey = stxPublicKeyHex(privateKey);
  return {
    network: 'stx:testnet',
    publicKey,
    address: 'ST000000000000000000002AMW42H',
    id: `stx-signer-${index}`,
    userId: `stx-user-${index}`,
    xpub: null,
    xpubOriginFingerprint: null,
    xpubOriginPath: null,
    signerIndex: index,
    signingPubkey: publicKey,
  };
});

const stxAccountDraft: VaultAccount = {
  id: 'stx-va-1',
  vaultId: 'stx-v-1',
  name: 'STX 2of3',
  icon: null,
  network: 'stx:testnet',
  threshold: 2,
  multisigAddress: '',
  accountIndex: 0,
  createdAt: '2026-06-22T09:04:15.571Z',
  signers: stxSigners,
  pendingTransactionCount: 0,
  queuedTransactionCount: 0,
};
const stxAccount: VaultAccount = {
  ...stxAccountDraft,
  multisigAddress: deriveMultisigAddress(stxAccountDraft),
};

const stxProposalRawPayload = '00112233445566778899aabbccddeeff00112233';
const stxProposalTimestamp = 1782000000;
const stxProposalHash = computeProposalHash({
  multisigAddress: stxAccount.multisigAddress,
  rawPayload: decodeProposalPayload('stx', stxProposalRawPayload),
  proposalTimestamp: stxProposalTimestamp,
});
const stxTransaction: MultisigTransaction = {
  id: 'stx-tx-1',
  vaultAccountId: stxAccount.id,
  network: 'stx:testnet',
  proposerUserId: 'stx-user-0',
  proposalRawPayload: stxProposalRawPayload,
  proposalSignature: signStructuredDataMessage(
    stringAsciiCV(stxProposalHash),
    buildStxProposalDomain('stx:testnet'),
    stxPrivateKeys[0]
  ).signature,
  proposalTimestamp: stxProposalTimestamp,
  proposalHash: stxProposalHash,
  nonce: 0,
  txId: null,
  status: 'pending',
  signatures: [],
  broadcastAt: null,
  createdAt: '2026-06-22T15:04:27.566Z',
  updatedAt: '2026-06-22T15:04:27.566Z',
};

describe(`${preSignVerification.name} (STX)`, () => {
  test('passes for a genuine STX proposal + vault', () => {
    expect(() =>
      preSignVerification({ transaction: stxTransaction, account: stxAccount })
    ).not.toThrow();
  });

  test('rejects a tampered proposal timestamp at the commitment check', () => {
    expect(() =>
      preSignVerification({
        transaction: { ...stxTransaction, proposalTimestamp: stxProposalTimestamp + 1 },
        account: stxAccount,
      })
    ).toThrow(/commitment/i);
  });

  test('rejects a single-character change to the proposal payload', () => {
    const proposalRawPayload = `01${stxProposalRawPayload.slice(2)}`;
    expect(() =>
      preSignVerification({
        transaction: { ...stxTransaction, proposalRawPayload },
        account: stxAccount,
      })
    ).toThrow(/commitment/i);
  });

  test('rejects a proposer that is not a signer on the account', () => {
    expect(() =>
      preSignVerification({
        transaction: { ...stxTransaction, proposerUserId: 'stx-nobody' },
        account: stxAccount,
      })
    ).toThrow(/not a signer/i);
  });

  test('rejects a proposal signed by a key other than the bound signing key', () => {
    // Attacker signs the commitment and substitutes their own publicKey, leaving the
    // bound signingPubkey honest. Verification anchors to signingPubkey, so it fails.
    const attackerPrivateKey = '4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f01';
    const signers = stxSigners.map(signer =>
      signer.userId === 'stx-user-0'
        ? { ...signer, publicKey: stxPublicKeyHex(attackerPrivateKey) }
        : signer
    );
    const attackerSignature = signStructuredDataMessage(
      stringAsciiCV(stxProposalHash),
      buildStxProposalDomain('stx:testnet'),
      attackerPrivateKey
    ).signature;
    expect(() =>
      preSignVerification({
        transaction: { ...stxTransaction, proposalSignature: attackerSignature },
        account: { ...stxAccount, signers },
      })
    ).toThrow(/commitment/i);
  });

  test('rejects a transaction whose network disagrees with the vault account', () => {
    expect(() =>
      preSignVerification({
        transaction: { ...stxTransaction, network: 'btc:mainnet' },
        account: stxAccount,
      })
    ).toThrow(/network does not match/i);
  });
});

// Real stx:mainnet 2-of-3 vault + a real extension-signed proposal (broadcast on
// chain). Unlike the synthetic block above, the proposalSignature here was produced
// by the actual wallet, so this proves our verifier agrees with the extension's
// SIP-018 output — not just with the in-repo signing library.
function realStxSigner(
  id: string,
  userId: string,
  publicKey: string,
  address: string,
  signerIndex: number
): VaultAccountSigner {
  return {
    network: 'stx:mainnet',
    publicKey,
    address,
    id,
    userId,
    xpub: null,
    xpubOriginFingerprint: null,
    xpubOriginPath: null,
    signerIndex,
    signingPubkey: publicKey,
  };
}

const realStxAccount: VaultAccount = {
  id: '1c6e1479-4c6d-4495-b50e-2af7812ff2e6',
  vaultId: '476656f3-5967-4be0-92df-fcc79e031d6b',
  name: 'STX 2of3 (deux)',
  icon: 'piggybank',
  network: 'stx:mainnet',
  threshold: 2,
  multisigAddress: 'SM3D2DNRRVABKVTZTD680CTNCD6KDPTRGC06G4JKK',
  accountIndex: 1,
  createdAt: '2026-06-23T14:03:56.337Z',
  signers: [
    realStxSigner(
      '99e0ec6e-58ba-4fa5-a908-6c45860d3291',
      '834974b4-239b-4cb0-9e1c-f01813510394',
      '024af1cf1974636213c5c197bb5eb8cc34601f17d1923bfb9fbe4f72a45abfa114',
      'SP3FJQK31NMDM594YKP1640V5WESX38ENSSJ3YC6B',
      0
    ),
    realStxSigner(
      '65f873ca-f4b7-4d48-9bd8-a9222e121c06',
      '0b9161c6-91ee-46f7-abdf-fbd93d4fe618',
      '03bea6b877b6007ace146b99f96b47373b50a61db4ae0801366ce8e3ffd2e6e1e0',
      'SPJYYA9MHWS5Z53WWNZN91AC1M4DB8P59DCENJMA',
      1
    ),
    realStxSigner(
      'd9dfe9cb-3f00-4d5b-afab-44058c753be0',
      '27298df0-7632-487b-8d94-64a36b9f2d9c',
      '033e8d8852ea1beb9bb7f65d1a4f8d56c038e50e65faf7bf1c7e7584d55f11d1f4',
      'SP3TB3AJ0XMZ9S6CGY2CQ6R06H1Z6DJQ1SH15ZP2H',
      2
    ),
  ],
  pendingTransactionCount: 0,
  queuedTransactionCount: 0,
};

const realStxTransaction: MultisigTransaction = {
  id: '577bc094-e9c8-4266-9dd5-c682d4b0b19d',
  vaultAccountId: realStxAccount.id,
  network: 'stx:mainnet',
  proposerUserId: '834974b4-239b-4cb0-9e1c-f01813510394',
  proposalRawPayload:
    '00000000010405da26d718da973debfa6990066aac69a6db6b106000000000000000000000000000000320000000000002030200000000000516f4b1aa40ed3e9c9990f099736006887e66cae1cc00000000002dc6c000000000000000000000000000000000000000000000000000000000000000000000',
  proposalSignature:
    'c8941d4a3b93f8b6d26c4804ce3119dd2b6232034a7b972b3d43551058fdaf8a5f34f8d1798f35d549b549c62c83ebfbe36b08748af38d3b008b57d259076eed01',
  proposalTimestamp: 1782224530,
  proposalHash: '4633a8678e407cd7d113f9af5a0b461b6f97cb070db9b6cadc2e27fb8428fcfd',
  nonce: 0,
  txId: 'bc1267dee77ba1b2a80311323d7903a9ee1206797ec06256b4ec230b2da599aa',
  status: 'broadcast',
  signatures: [],
  broadcastAt: '2026-06-24T08:10:34.402Z',
  createdAt: '2026-06-23T14:22:13.305Z',
  updatedAt: '2026-06-24T08:10:34.402Z',
};

describe(`${preSignVerification.name} (STX, real extension-signed)`, () => {
  test('passes for a real extension-signed STX proposal + vault', () => {
    expect(() =>
      preSignVerification({ transaction: realStxTransaction, account: realStxAccount })
    ).not.toThrow();
  });
});
