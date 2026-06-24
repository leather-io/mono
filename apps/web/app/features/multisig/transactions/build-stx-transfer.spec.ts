import {
  AddressHashMode,
  AddressVersion,
  addressFromPublicKeys,
  addressToString,
  createStacksPublicKey,
} from '@stacks/transactions';

import type { VaultAccount, VaultAccountSigner } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import { buildUnsignedMultisigStxTransfer } from './build-stx-transfer';

const publicKeys = [
  '0250863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b2352',
  '03774ae7f858a9411e5ef4246b70c65aac5649980be5c17891bbec17895da008cb',
  '02f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9',
];

const recipient = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';

function deriveTestnetAddress(threshold: number, keys: string[]) {
  return addressToString(
    addressFromPublicKeys(
      AddressVersion.TestnetMultiSig,
      AddressHashMode.P2SHNonSequential,
      threshold,
      keys.map(createStacksPublicKey)
    )
  );
}

function makeSigner(signerIndex: number, signingPubkey: string): VaultAccountSigner {
  return {
    network: 'stx:testnet',
    publicKey: signingPubkey,
    address: 'ST000000000000000000002AMW42H',
    id: `signer-${signerIndex}`,
    userId: `user-${signerIndex}`,
    xpub: null,
    xpubOriginFingerprint: null,
    xpubOriginPath: null,
    signerIndex,
    signingPubkey,
  };
}

function makeAccount(overrides: Partial<VaultAccount> = {}): VaultAccount {
  return {
    id: 'va-1',
    vaultId: 'v-1',
    name: 'Test vault account',
    icon: null,
    network: 'stx:testnet',
    threshold: 2,
    multisigAddress: deriveTestnetAddress(2, publicKeys),
    accountIndex: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    signers: publicKeys.map((key, index) => makeSigner(index, key)),
    pendingTransactionCount: 0,
    queuedTransactionCount: 0,
    ...overrides,
  };
}

describe(buildUnsignedMultisigStxTransfer.name, () => {
  test('builds a non-sequential multisig transfer with placeholder nonce 0', async () => {
    const tx = await buildUnsignedMultisigStxTransfer({
      account: makeAccount(),
      recipient,
      amount: createMoney(1_000_000, 'STX'),
      fee: createMoney(3000, 'STX'),
    });

    const { spendingCondition } = tx.auth;
    expect(spendingCondition.hashMode).toEqual(AddressHashMode.P2SHNonSequential);
    expect(Number(spendingCondition.nonce)).toEqual(0);
    expect(Number(spendingCondition.fee)).toEqual(3000);
    expect(
      'signaturesRequired' in spendingCondition && spendingCondition.signaturesRequired
    ).toEqual(2);
  });

  test('defaults the fee to zero for the estimation pass', async () => {
    const tx = await buildUnsignedMultisigStxTransfer({
      account: makeAccount(),
      recipient,
      amount: createMoney(1_000_000, 'STX'),
    });

    expect(Number(tx.auth.spendingCondition.fee)).toEqual(0);
  });

  test('orders signer public keys by signer index regardless of input order', async () => {
    const shuffledSigners = [...makeAccount().signers].reverse();

    const tx = await buildUnsignedMultisigStxTransfer({
      account: makeAccount({ signers: shuffledSigners }),
      recipient,
      amount: createMoney(1_000_000, 'STX'),
    });

    expect(tx.auth.spendingCondition.hashMode).toEqual(AddressHashMode.P2SHNonSequential);
  });

  test('throws when the derived sender does not match the vault address', async () => {
    await expect(
      buildUnsignedMultisigStxTransfer({
        account: makeAccount({ multisigAddress: 'SN2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4BG6ZQ5R' }),
        recipient,
        amount: createMoney(1_000_000, 'STX'),
      })
    ).rejects.toThrow('does not match vault address');
  });
});
