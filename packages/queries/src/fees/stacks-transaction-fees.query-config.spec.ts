import { makeUnsignedSTXTokenTransfer } from '@stacks/transactions';
import { describe, expect, test } from 'vitest';

import { defaultNetworksKeyedById } from '@leather.io/models';
import type { UserSettings } from '@leather.io/services';

import { createStacksTransactionFeesQueryKey } from './stacks-transaction-fees.query-config';

const settings: UserSettings = {
  network: defaultNetworksKeyedById.mainnet,
  quoteCurrency: 'USD',
  assetVisibility: {},
};

async function makeTransaction(numSignatures: number) {
  return makeUnsignedSTXTokenTransfer({
    publicKeys: [
      '0250863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b2352',
      '03774ae7f858a9411e5ef4246b70c65aac5649980be5c17891bbec17895da008cb',
    ],
    numSignatures,
    useNonSequentialMultiSig: true,
    recipient: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
    amount: 1,
    fee: 0,
    nonce: 0,
    network: 'testnet',
  });
}

describe(createStacksTransactionFeesQueryKey.name, () => {
  test('separates estimates for different multisig thresholds', async () => {
    const oneSignature = await makeTransaction(1);
    const twoSignatures = await makeTransaction(2);
    expect(createStacksTransactionFeesQueryKey(oneSignature, settings, 2)).not.toEqual(
      createStacksTransactionFeesQueryKey(twoSignatures, settings, 2)
    );
  });

  test('separates estimates for different signer counts', async () => {
    const tx = await makeTransaction(1);
    expect(createStacksTransactionFeesQueryKey(tx, settings, 2)).not.toEqual(
      createStacksTransactionFeesQueryKey(tx, settings, 3)
    );
  });
});
