import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';
import { makeUnsignedSTXTokenTransfer } from '@stacks/transactions';

import { deriveStxMultisigAddress } from '@leather.io/stacks';

import { getTxSenderAddress, isNonSequentialMultisigTransaction } from './transaction.utils';

const publicKeys = [
  '0250863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b2352',
  '03774ae7f858a9411e5ef4246b70c65aac5649980be5c17891bbec17895da008cb',
  '02f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9',
];

const recipient = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';

describe(isNonSequentialMultisigTransaction.name, () => {
  test('is true for a non-sequential multisig transaction', async () => {
    const tx = await makeUnsignedSTXTokenTransfer({
      recipient,
      amount: 1_000_000,
      fee: 3000,
      nonce: 0,
      network: STACKS_TESTNET,
      publicKeys,
      numSignatures: 2,
      useNonSequentialMultiSig: true,
    });
    expect(isNonSequentialMultisigTransaction(tx)).toEqual(true);
  });

  test('is false for a sequential multisig transaction', async () => {
    const tx = await makeUnsignedSTXTokenTransfer({
      recipient,
      amount: 1_000_000,
      fee: 3000,
      nonce: 0,
      network: STACKS_TESTNET,
      publicKeys,
      numSignatures: 2,
    });
    expect(isNonSequentialMultisigTransaction(tx)).toEqual(false);
  });

  test('is false for a singlesig transaction', async () => {
    const tx = await makeUnsignedSTXTokenTransfer({
      recipient,
      amount: 1_000_000,
      fee: 3000,
      nonce: 0,
      network: STACKS_TESTNET,
      publicKey: publicKeys[0],
    });
    expect(isNonSequentialMultisigTransaction(tx)).toEqual(false);
  });
});

describe(getTxSenderAddress.name, () => {
  test.each([STACKS_TESTNET, STACKS_MAINNET])(
    'matches the derived multisig policy address on chainId $chainId',
    async network => {
      const threshold = 2;
      const tx = await makeUnsignedSTXTokenTransfer({
        recipient,
        amount: 1_000_000,
        fee: 3000,
        nonce: 0,
        network,
        publicKeys,
        numSignatures: threshold,
        useNonSequentialMultiSig: true,
      });
      expect(getTxSenderAddress(tx)).toEqual(
        deriveStxMultisigAddress({ publicKeys, threshold, chainId: network.chainId })
      );
    }
  );
});
