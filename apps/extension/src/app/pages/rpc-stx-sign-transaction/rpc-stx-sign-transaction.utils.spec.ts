import { ChainId } from '@stacks/network';
import { makeUnsignedSTXTokenTransfer } from '@stacks/transactions';
import { describe, expect, test } from 'vitest';

import { deriveStxMultisigAddress } from '@leather.io/stacks';

import type { PolicyStore } from '@app/store/policy/policy-store.utils';

import { isUnsignedStacksTransactionForPolicy } from './rpc-stx-sign-transaction.utils';

const signerPublicKey = '031b84c5567b126440995d3ed5aaba0565d71e1834604819ff9c17f5e9d5dd078f';
const cosignerPublicKey = '024d4b6cd1361032ca9bd2aeb9d900aa4d45d9ead80ac9423374c451a7254d0766';
const otherCosignerPublicKey = '02531fe6068134503d2723133227c867ac8fa6c83c537e9a44c3c5bdbdcb1fe337';
const publicKeys = [signerPublicKey, cosignerPublicKey];
const threshold = 2;
const networkId = 'mainnet';
const chainId = ChainId.Mainnet;
const address = deriveStxMultisigAddress({ publicKeys, threshold, chainId });

function makePolicy(): PolicyStore {
  return {
    id: `fingerprint/0/${address}/${networkId}`,
    parentAccountId: 'fingerprint/0',
    networkId,
    address,
    role: 'signer',
    chain: 'stacks',
    publicKeys,
    threshold,
  };
}

interface MakeTransactionArgs {
  publicKeys?: string[];
  threshold?: number;
}

function makeTransaction({
  publicKeys: transactionPublicKeys = [...publicKeys],
  threshold = 2,
}: MakeTransactionArgs = {}) {
  return makeUnsignedSTXTokenTransfer({
    recipient: 'SPXH3HNBPM5YP15VH16ZXZ9AX6CK289K3MCXRKCB',
    amount: 1,
    fee: 1,
    nonce: 0,
    network: 'mainnet',
    publicKeys: transactionPublicKeys,
    numSignatures: threshold,
    useNonSequentialMultiSig: true,
  });
}

describe(isUnsignedStacksTransactionForPolicy.name, () => {
  test('accepts a multisig transaction for the selected Stacks policy', async () => {
    const tx = await makeTransaction();

    expect(
      isUnsignedStacksTransactionForPolicy({
        tx,
        policy: makePolicy(),
        signerPublicKey,
        chainId,
        networkId,
      })
    ).toBe(true);
  });

  test('rejects a multisig transaction for another policy that includes the signer key', async () => {
    const tx = await makeTransaction({
      publicKeys: [signerPublicKey, otherCosignerPublicKey],
    });

    expect(
      isUnsignedStacksTransactionForPolicy({
        tx,
        policy: makePolicy(),
        signerPublicKey,
        chainId,
        networkId,
      })
    ).toBe(false);
  });

  test('rejects a multisig transaction with a different threshold', async () => {
    const tx = await makeTransaction({ threshold: 1 });

    expect(
      isUnsignedStacksTransactionForPolicy({
        tx,
        policy: makePolicy(),
        signerPublicKey,
        chainId,
        networkId,
      })
    ).toBe(false);
  });

  test('rejects when the selected signer is not in the policy', async () => {
    const tx = await makeTransaction();

    expect(
      isUnsignedStacksTransactionForPolicy({
        tx,
        policy: makePolicy(),
        signerPublicKey: otherCosignerPublicKey,
        chainId,
        networkId,
      })
    ).toBe(false);
  });

  test('rejects when the selected network differs from the policy network', async () => {
    const tx = await makeTransaction();

    expect(
      isUnsignedStacksTransactionForPolicy({
        tx,
        policy: makePolicy(),
        signerPublicKey,
        chainId,
        networkId: 'testnet',
      })
    ).toBe(false);
  });
});
