import { beforeEach, describe, expect, test, vi } from 'vitest';

import { makeAccountIdentifer } from '@leather.io/crypto';
import { defaultNetworksKeyedById } from '@leather.io/models';
import type { WalletStore } from '@leather.io/state/wallet';

import { type PolicyStore, makePolicyId } from './policy-store.utils';
import { filterPoliciesByParentAndNetwork, selectCurrentPolicy } from './policy.selectors';

const mocks = vi.hoisted(() => ({ searchParams: new URLSearchParams() }));

vi.mock('@app/common/initial-search-params', () => ({
  initialSearchParams: mocks.searchParams,
}));

vi.mock('../networks/networks.selectors', () => ({
  selectCurrentNetwork: vi.fn(),
}));

vi.mock('../software-keys/software-key.selectors', () => ({
  selectCurrentAccount: vi.fn(),
}));

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

function createWalletEntities(fingerprints: string[]): Record<string, WalletStore> {
  const entities: Record<string, WalletStore> = {};
  for (const value of fingerprints)
    entities[value] = { fingerprint: value, type: 'software', name: 'Wallet', createdOn: null };
  return entities;
}

describe('selectCurrentPolicy', () => {
  const policy = bitcoinPolicy(parentAccountIdA);
  const policies = { [policy.id]: policy };
  const currentAccount = { fingerprint: 'abcd1234', accountIndex: 0 };
  const mainnet = defaultNetworksKeyedById.mainnet;
  const wallets = createWalletEntities(['abcd1234']);

  beforeEach(() => {
    for (const key of Array.from(mocks.searchParams.keys())) {
      mocks.searchParams.delete(key);
    }
  });

  test('returns the globally active policy when no account is pinned in the url params', () => {
    expect(
      selectCurrentPolicy.resultFunc(policies, policy.id, false, wallets, currentAccount, mainnet)
    ).toEqual(policy);
  });

  test('returns null when no account is pinned and no policy is active', () => {
    expect(
      selectCurrentPolicy.resultFunc(policies, null, false, wallets, currentAccount, mainnet)
    ).toBeNull();
  });

  test('returns the globally active policy once the user switches accounts', () => {
    mocks.searchParams.set('fingerprint', 'abcd1234');
    mocks.searchParams.set('policyId', 'some-other-policy');

    expect(
      selectCurrentPolicy.resultFunc(policies, policy.id, true, wallets, currentAccount, mainnet)
    ).toEqual(policy);
  });

  test('falls back to the globally active policy when the pinned fingerprint has no wallet', () => {
    mocks.searchParams.set('fingerprint', 'feedface');
    mocks.searchParams.set('policyId', policy.id);

    expect(
      selectCurrentPolicy.resultFunc(policies, policy.id, false, wallets, currentAccount, mainnet)
    ).toEqual(policy);
  });

  test('returns null for a pinned account without a policy binding even when a policy is active', () => {
    mocks.searchParams.set('fingerprint', 'abcd1234');
    mocks.searchParams.set('accountIndex', '0');

    expect(
      selectCurrentPolicy.resultFunc(policies, policy.id, false, wallets, currentAccount, mainnet)
    ).toBeNull();
  });

  test('returns the pinned policy when the url params carry a policy binding', () => {
    mocks.searchParams.set('fingerprint', 'abcd1234');
    mocks.searchParams.set('policyId', policy.id);

    expect(
      selectCurrentPolicy.resultFunc(policies, null, false, wallets, currentAccount, mainnet)
    ).toEqual(policy);
  });

  test('returns null when the pinned policy is not in the store', () => {
    mocks.searchParams.set('fingerprint', 'abcd1234');
    mocks.searchParams.set('policyId', 'unknown-policy');

    expect(
      selectCurrentPolicy.resultFunc(policies, null, false, wallets, currentAccount, mainnet)
    ).toBeNull();
  });

  test('returns null when the pinned policy is on another network', () => {
    const testnetPolicy = bitcoinPolicy(parentAccountIdA, {
      address: 'tb1qtestnet',
      networkId: 'testnet4',
    });
    mocks.searchParams.set('fingerprint', 'abcd1234');
    mocks.searchParams.set('policyId', testnetPolicy.id);

    expect(
      selectCurrentPolicy.resultFunc(
        { [testnetPolicy.id]: testnetPolicy },
        null,
        false,
        wallets,
        currentAccount,
        mainnet
      )
    ).toBeNull();
  });

  test('returns null when the pinned policy belongs to a different parent account', () => {
    const otherParentPolicy = bitcoinPolicy(parentAccountIdB, { address: 'bc1qother' });
    mocks.searchParams.set('fingerprint', 'abcd1234');
    mocks.searchParams.set('policyId', otherParentPolicy.id);

    expect(
      selectCurrentPolicy.resultFunc(
        { [otherParentPolicy.id]: otherParentPolicy },
        null,
        false,
        wallets,
        currentAccount,
        mainnet
      )
    ).toBeNull();
  });
});
