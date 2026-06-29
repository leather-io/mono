import { describe, expect, test } from 'vitest';

import { makeAccountIdentifer } from '@leather.io/crypto';

import { type PolicyStore, makePolicyId } from './policy-store.utils';
import { filterPoliciesByParentAndNetwork } from './policy.selectors';

const parentAccountIdA = makeAccountIdentifer('abcd1234', 0);
const parentAccountIdB = makeAccountIdentifer('beef5678', 0);

function bitcoinPolicy(
  parentAccountId: string,
  { address = 'bc1qaddr', networkId = 'mainnet' } = {}
): PolicyStore {
  return {
    id: makePolicyId(parentAccountId, address, networkId),
    parentAccountId,
    networkId,
    chain: 'bitcoin',
    address,
    descriptor: 'wsh(sortedmulti(2,xpubA/0/0,xpubB/0/0))',
    role: 'signer',
  };
}

describe('filterPoliciesByParentAndNetwork', () => {
  test('returns only policies for the given parent and network', () => {
    const match = bitcoinPolicy(parentAccountIdA, { address: 'bc1qmainnet', networkId: 'mainnet' });
    const otherNetwork = bitcoinPolicy(parentAccountIdA, {
      address: 'tb1qtestnet',
      networkId: 'testnet4',
    });
    const otherParent = bitcoinPolicy(parentAccountIdB, {
      address: 'bc1qother',
      networkId: 'mainnet',
    });

    expect(
      filterPoliciesByParentAndNetwork(
        [match, otherNetwork, otherParent],
        parentAccountIdA,
        'mainnet'
      )
    ).toEqual([match]);
  });

  test('excludes same-parent policies registered on other networks (no cross-network leak)', () => {
    const mainnet = bitcoinPolicy(parentAccountIdA, {
      address: 'bc1qmainnet',
      networkId: 'mainnet',
    });
    const testnet = bitcoinPolicy(parentAccountIdA, {
      address: 'tb1qtestnet',
      networkId: 'testnet4',
    });
    const signet = bitcoinPolicy(parentAccountIdA, { address: 'sb1qsignet', networkId: 'signet' });

    expect(
      filterPoliciesByParentAndNetwork([mainnet, testnet, signet], parentAccountIdA, 'mainnet')
    ).toEqual([mainnet]);
  });

  test('returns an empty array when no policy matches the network', () => {
    const testnet = bitcoinPolicy(parentAccountIdA, { networkId: 'testnet4' });
    expect(filterPoliciesByParentAndNetwork([testnet], parentAccountIdA, 'mainnet')).toEqual([]);
  });
});
