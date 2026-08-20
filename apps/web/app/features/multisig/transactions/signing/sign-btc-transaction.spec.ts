import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  getBondVaultKeys,
  getP2wpkhAddressFromPublicKey,
  reconstructBondDescriptor,
  psbtBase64ToHex,
} from '@leather.io/bitcoin';
import type { MultisigTransaction, VaultAccount } from '@leather.io/models';

import { getMultisigDescriptor } from '../btc-multisig-descriptor';
import { signBtcTransaction } from './sign-btc-transaction';

const mocks = vi.hoisted(() => ({ signPsbt: vi.fn() }));

vi.mock('~/utils/leather-sdk', () => ({ leather: { signPsbt: mocks.signPsbt } }));

// Deterministic 2-of-2 btc:mainnet vault (HDKeys from fill(21)/fill(22) seeds at
// m/84'/0'/0', accountIndex 0) with two cryptographically valid proposals: one
// plain multisig spend and one bond early-exit spend. The BIP-322 commitments
// were generated over these exact payloads, so the real preSignVerification runs
// and must pass for signing to reach the wallet.
const xpubA =
  'xpub6Cp7XZrBwYTMRv5FXmFTprP6CMbPxKikX6dCHmMT2Ug7YobW6VAQ5pMXCna1twbXr6oBWVsU7RSmUn5Duk4pGar74z4twzNkupvZinxjxNU';
const xpubB =
  'xpub6C4XSrJohzRUjn7RSt8TRsuSH2X3RhxHff2EcQJ8gtpreRSNhfWhUVHv47YwSWtk4TPomR8zduMBPfuWSRXdvKbsukyEfkTExPN3GApAsEu';
const publicKeyA = '03695129d7bbd06fc93fb1484838a153579ce52e11bfa888b1e6d1c4b10f86167d';
const publicKeyB = '02614124c88804fba50302fa8a5e9e972e397cfa5193b319a6a34edb013f197e2e';
const proposerUserId = 'user-a';
const proposalTimestamp = 1782000000;

const bondUnlockHeight = 900_000;
const bondHash = '039058c6f2c0cb492c533b0a4d14ef77cc0f78abccced5287d84a1a2011cfb81';
const bondCovenantPubkey = '0299b4e3e58af8bc44c1a10d3c842abf9c4739ae7462ed346f95d6807c6ea4de97';

const plainPayload =
  'cHNidP8BAFICAAAAARERERERERERERERERERERERERERERERERERERERERERAAAAAAD/////AcivAAAAAAAAFgAUM7ateIY6Qvzg9YR3ZFYMuye69CkAAAAAAAEBK1DDAAAAAAAAIgAgvYeU1HXUuk+3kaJlcNX13RCd0jA+jRliBOdRX6wIk1UBBUdSIQJhQSTIiAT7pQMC+openpcuOXz6UZOzGaajTtsBPxl+LiEDaVEp17vQb8k/sUhIOKFTV5zlLhG/qIix5tHEsQ+GFn1SrgAA';
const plainProposalHash = '3073e9d4f3c30ef936d94e74c1e591536ecd9b3ea68e4201b6925b2cc8be2099';
const plainSignature =
  'AkgwRQIhALNdkuVFOUMkygyBSbb/FwjoaBP9eVHrdXVGd7cpQBehAiA0ghCzzNVeuIVha+5eJLU4ajAaZQlQx/YMT+HWT3H4QQEhA2lRKde70G/JP7FISDihU1ec5S4Rv6iIsebRxLEPhhZ9';

const bondPayload =
  'cHNidP8BAFICAAAAARERERERERERERERERERERERERERERERERERERERERERAAAAAAD/////AcivAAAAAAAAFgAUM7ateIY6Qvzg9YR3ZFYMuye69CkAAAAAAAEBK1DDAAAAAAAAIgAgJ8N86a/NKj2d1Rqnoy/FXX2a+jBK7jxZSCKkhlaKa8oBBZpjA6C7DbFnggEgiKggA5BYxvLAy0ksUzsKTRTvd8wPeKvMztUofYShogEc+4GIIQKZtOPlivi8RMGhDTyEKr+cRzmudGLtNG+V1oB8bqTel6xoaVIhAmFBJMiIBPulAwL6il6ely45fPpRk7MZpqNO2wE/GX4uIQNpUSnXu9BvyT+xSEg4oVNXnOUuEb+oiLHm0cSxD4YWfVKuAAA=';
const bondProposalHash = '7b9c3868f9998b4adf621eb0572dfca5a19bceb2e939c8e752b539047567d691';
const bondSignature =
  'AkcwRAIgE79zcqEGHiIpIFBxxzXIp+eCYGyyPlEJvsSFXv2uZUQCICus9Rq9VgBeY/U3MuwdTmyNTfaVryhTeNKjwMnkAdFvASEDaVEp17vQb8k/sUhIOKFTV5zlLhG/qIix5tHEsQ+GFn0=';

function makeSigner(index: number, publicKey: string, xpub: string) {
  return {
    network: 'btc:mainnet' as const,
    publicKey,
    address: getP2wpkhAddressFromPublicKey(publicKey, 'mainnet'),
    id: `signer-${index}`,
    userId: index === 0 ? proposerUserId : `user-${index}`,
    xpub,
    xpubOriginFingerprint: 'f1f1f1f1',
    xpubOriginPath: "m/84'/0'/0'",
    signerIndex: index,
    signingPubkey: publicKey,
  };
}

const account: VaultAccount = {
  id: 'vault-account-1',
  vaultId: 'vault-1',
  name: 'BTC 2of2',
  icon: null,
  network: 'btc:mainnet',
  threshold: 2,
  multisigAddress: 'bc1qhkref4r46jayldu35fjhp404m5gfm53s86x3jcsyuag4ltqgjd2s8ugvhq',
  accountIndex: 0,
  createdAt: '2026-08-01T00:00:00.000Z',
  signers: [makeSigner(0, publicKeyA, xpubA), makeSigner(1, publicKeyB, xpubB)],
  pendingTransactionCount: 0,
  queuedTransactionCount: 0,
};

function makeTransaction(
  proposalRawPayload: string,
  proposalSignature: string,
  proposalHash: string
): MultisigTransaction {
  return {
    id: 'tx-1',
    vaultAccountId: account.id,
    network: 'btc:mainnet',
    proposerUserId,
    proposalRawPayload,
    proposalSignature,
    proposalTimestamp,
    proposalHash,
    nonce: null,
    txId: null,
    status: 'pending',
    signatures: [],
    broadcastAt: null,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  };
}

const plainTransaction = makeTransaction(plainPayload, plainSignature, plainProposalHash);
const bondTransaction = makeTransaction(bondPayload, bondSignature, bondProposalHash);

describe(signBtcTransaction.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.signPsbt.mockImplementation(({ hex }: { hex: string }) => Promise.resolve({ hex }));
  });

  test('passes the vault policy descriptor for a plain multisig proposal', async () => {
    await signBtcTransaction(plainTransaction, account, publicKeyA);
    expect(mocks.signPsbt).toHaveBeenCalledTimes(1);
    expect(mocks.signPsbt).toHaveBeenCalledWith({
      hex: psbtBase64ToHex(plainPayload),
      descriptor: getMultisigDescriptor(account),
      network: 'mainnet',
      account: 0,
    });
  });

  test('passes the reconstructed bond descriptor for a bond early-exit proposal', async () => {
    await signBtcTransaction(bondTransaction, account, publicKeyA);
    const expectedBondDescriptor = reconstructBondDescriptor({
      unlockHeight: bondUnlockHeight,
      hash: bondHash,
      covenantPubkey: bondCovenantPubkey,
      ...getBondVaultKeys(getMultisigDescriptor(account)),
    });
    expect(mocks.signPsbt).toHaveBeenCalledTimes(1);
    expect(mocks.signPsbt).toHaveBeenCalledWith({
      hex: psbtBase64ToHex(bondPayload),
      descriptor: expectedBondDescriptor,
      network: 'mainnet',
      account: 0,
    });
  });

  test('rejects a tampered bond payload before the wallet is invoked', async () => {
    const tampered = { ...bondTransaction, proposalTimestamp: proposalTimestamp + 1 };
    await expect(signBtcTransaction(tampered, account, publicKeyA)).rejects.toThrow(/commitment/i);
    expect(mocks.signPsbt).not.toHaveBeenCalled();
  });
});
