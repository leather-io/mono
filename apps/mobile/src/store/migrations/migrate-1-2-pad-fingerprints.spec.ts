import { describe, expect, test } from 'vitest';

import { migratePadFingerprints } from './migrate-1-2-pad-fingerprints';

describe('migratePadFingerprints', () => {
  test('should pad fingerprints with leading zeros in descriptors', () => {
    const originalState = {
      _persist: { version: 1, rehydrated: true },
      keychains: {
        ids: ["30b34f3/84'/0'/0'"],
        entities: {
          "30b34f3/84'/0'/0'": {
            descriptor: "[30b34f3/84'/0'/0']xpubtest",
            chain: 'bitcoin' as const,
          },
        },
      },
      wallets: {
        ids: [],
        entities: {},
      },
      accounts: {
        ids: [],
        entities: {},
      },
    };

    const result = migratePadFingerprints(originalState);

    expect(result.keychains.entities["30b34f3/84'/0'/0'"]?.descriptor).toEqual(
      "[030b34f3/84'/0'/0']xpubtest"
    );
  });

  test('should pad fingerprints in wallet entities', () => {
    const originalState = {
      _persist: { version: 1, rehydrated: true },
      wallets: {
        ids: ['30b34f3'],
        entities: {
          '30b34f3': {
            fingerprint: '30b34f3',
            type: 'software',
            createdOn: '2024-01-01',
          },
        },
      },
      keychains: {
        ids: [],
        entities: {},
      },
      accounts: {
        ids: [],
        entities: {},
      },
    };

    const result = migratePadFingerprints(originalState);

    expect(result.wallets.ids).toEqual(['030b34f3']);
    expect(result.wallets.entities['030b34f3']).toEqual({
      fingerprint: '030b34f3',
      type: 'software',
      createdOn: '2024-01-01',
    });
    expect(result.wallets.entities['30b34f3']).toBeUndefined();
  });

  test('should pad fingerprints in account IDs', () => {
    const originalState = {
      _persist: { version: 1, rehydrated: true },
      accounts: {
        ids: ['30b34f3/0', '30b34f3/1'],
        entities: {
          '30b34f3/0': {
            id: '30b34f3/0',
            name: 'Account 1',
          },
          '30b34f3/1': {
            id: '30b34f3/1',
            name: 'Account 2',
          },
        },
      },
      keychains: {
        ids: [],
        entities: {},
      },
      wallets: {
        ids: [],
        entities: {},
      },
    };

    const result = migratePadFingerprints(originalState);

    expect(result.accounts.ids).toEqual(['030b34f3/0', '030b34f3/1']);
    expect(result.accounts.entities['030b34f3/0']).toEqual({
      id: '030b34f3/0',
      name: 'Account 1',
    });
    expect(result.accounts.entities['030b34f3/1']).toEqual({
      id: '030b34f3/1',
      name: 'Account 2',
    });
  });

  test('should not modify fingerprints that are already correctly padded', () => {
    const originalState = {
      _persist: { version: 1, rehydrated: true },
      wallets: {
        ids: ['24682ead'],
        entities: {
          '24682ead': {
            fingerprint: '24682ead',
            type: 'software',
          },
        },
      },
      accounts: {
        ids: ['24682ead/0'],
        entities: {
          '24682ead/0': {
            id: '24682ead/0',
            name: 'Account 1',
          },
        },
      },
      keychains: {
        ids: ["24682ead/84'/0'/0'"],
        entities: {
          "24682ead/84'/0'/0'": {
            descriptor: "[24682ead/84'/0'/0']xpubtest",
            chain: 'bitcoin' as const,
          },
        },
      },
    };

    const result = migratePadFingerprints(originalState);

    expect(result.wallets.entities['24682ead']?.fingerprint).toEqual('24682ead');
    expect(result.accounts.entities['24682ead/0']?.id).toEqual('24682ead/0');
    expect(result.keychains.entities["24682ead/84'/0'/0'"]?.descriptor).toEqual(
      "[24682ead/84'/0'/0']xpubtest"
    );
  });

  test('should handle multiple wallets and accounts with different fingerprints', () => {
    const originalState = {
      _persist: { version: 1, rehydrated: true },
      wallets: {
        ids: ['30b34f3', '24682ead', 'abcdef1'],
        entities: {
          '30b34f3': { fingerprint: '30b34f3', type: 'software' },
          '24682ead': { fingerprint: '24682ead', type: 'software' },
          abcdef1: { fingerprint: 'abcdef1', type: 'software' },
        },
      },
      accounts: {
        ids: ['30b34f3/0', '24682ead/0', 'abcdef1/0'],
        entities: {
          '30b34f3/0': { id: '30b34f3/0', name: 'Account 1' },
          '24682ead/0': { id: '24682ead/0', name: 'Account 2' },
          'abcdef1/0': { id: 'abcdef1/0', name: 'Account 3' },
        },
      },
      keychains: {
        ids: ['desc-1', 'desc-2', 'desc-3'],
        entities: {
          'desc-1': { descriptor: "[30b34f3/84'/0'/0']xpub1", chain: 'bitcoin' as const },
          'desc-2': { descriptor: "[24682ead/84'/0'/0']xpub2", chain: 'bitcoin' as const },
          'desc-3': { descriptor: "[abcdef1/84'/0'/0']xpub3", chain: 'bitcoin' as const },
        },
      },
    };

    const result = migratePadFingerprints(originalState);

    expect(result.wallets.ids).toEqual(['030b34f3', '24682ead', '0abcdef1']);
    expect(result.accounts.ids).toEqual(['030b34f3/0', '24682ead/0', '0abcdef1/0']);
    expect(result.keychains.entities['desc-1']?.descriptor).toEqual("[030b34f3/84'/0'/0']xpub1");
    expect(result.keychains.entities['desc-2']?.descriptor).toEqual("[24682ead/84'/0'/0']xpub2");
    expect(result.keychains.entities['desc-3']?.descriptor).toEqual("[0abcdef1/84'/0'/0']xpub3");
  });

  test('should preserve other state properties unchanged', () => {
    const originalState = {
      _persist: { version: 1, rehydrated: true },
      settings: { theme: 'dark' },
      apps: { list: [] },
      wallets: { ids: [], entities: {} },
      accounts: { ids: [], entities: {} },
      keychains: { ids: [], entities: {} },
    };

    const result = migratePadFingerprints(originalState) as any;

    expect(result.settings).toEqual({ theme: 'dark' });
    expect(result.apps).toEqual({ list: [] });
  });

  test('should handle empty state gracefully', () => {
    const originalState = {
      _persist: { version: 1, rehydrated: true },
      wallets: { ids: [], entities: {} },
      accounts: { ids: [], entities: {} },
      keychains: { ids: [], entities: {} },
    };

    const result = migratePadFingerprints(originalState);

    expect(result.wallets.ids).toEqual([]);
    expect(result.accounts.ids).toEqual([]);
    expect(result.keychains.ids).toEqual([]);
  });

  test('should update all keychains comprehensively', () => {
    const originalState = {
      _persist: { version: 1, rehydrated: true },
      wallets: {
        ids: ['30b34f3'],
        entities: {
          '30b34f3': { fingerprint: '30b34f3', type: 'software' },
        },
      },
      accounts: {
        ids: ['30b34f3/0'],
        entities: {
          '30b34f3/0': { id: '30b34f3/0', name: 'Account 1' },
        },
      },
      keychains: {
        ids: ['desc-bitcoin-mainnet', 'desc-bitcoin-testnet', 'desc-stacks'],
        entities: {
          'desc-bitcoin-mainnet': {
            descriptor: "[30b34f3/84'/0'/0']xpubBitcoinMainnet",
            chain: 'bitcoin' as const,
          },
          'desc-bitcoin-testnet': {
            descriptor: "[30b34f3/84'/1'/0']xpubBitcoinTestnet",
            chain: 'bitcoin' as const,
          },
          'desc-stacks': {
            descriptor: "[30b34f3/44'/5757'/0']xpubStacks",
            chain: 'stacks' as const,
          },
        },
      },
    };

    const result = migratePadFingerprints(originalState);

    expect(result.keychains.entities['desc-bitcoin-mainnet']?.descriptor).toEqual(
      "[030b34f3/84'/0'/0']xpubBitcoinMainnet"
    );
    expect(result.keychains.entities['desc-bitcoin-testnet']?.descriptor).toEqual(
      "[030b34f3/84'/1'/0']xpubBitcoinTestnet"
    );
    expect(result.keychains.entities['desc-stacks']?.descriptor).toEqual(
      "[030b34f3/44'/5757'/0']xpubStacks"
    );
  });

  test('should handle multiple wallets each with multiple keychains', () => {
    const originalState = {
      _persist: { version: 1, rehydrated: true },
      wallets: {
        ids: ['30b34f3', 'abcdef1'],
        entities: {
          '30b34f3': { fingerprint: '30b34f3', type: 'software' },
          abcdef1: { fingerprint: 'abcdef1', type: 'software' },
        },
      },
      accounts: {
        ids: ['30b34f3/0', 'abcdef1/0'],
        entities: {
          '30b34f3/0': { id: '30b34f3/0', name: 'Wallet 1 Account 1' },
          'abcdef1/0': { id: 'abcdef1/0', name: 'Wallet 2 Account 1' },
        },
      },
      keychains: {
        ids: [
          'w1-btc-mainnet',
          'w1-btc-testnet',
          'w1-btc-taproot',
          'w1-stacks',
          'w2-btc-mainnet',
          'w2-btc-testnet',
        ],
        entities: {
          'w1-btc-mainnet': {
            descriptor: "[30b34f3/84'/0'/0']xpub1",
            chain: 'bitcoin' as const,
          },
          'w1-btc-testnet': {
            descriptor: "[30b34f3/84'/1'/0']xpub2",
            chain: 'bitcoin' as const,
          },
          'w1-btc-taproot': {
            descriptor: "[30b34f3/86'/0'/0']xpub3",
            chain: 'bitcoin' as const,
          },
          'w1-stacks': {
            descriptor: "[30b34f3/44'/5757'/0']xpub4",
            chain: 'stacks' as const,
          },
          'w2-btc-mainnet': {
            descriptor: "[abcdef1/84'/0'/0']xpub5",
            chain: 'bitcoin' as const,
          },
          'w2-btc-testnet': {
            descriptor: "[abcdef1/84'/1'/0']xpub6",
            chain: 'bitcoin' as const,
          },
        },
      },
    };

    const result = migratePadFingerprints(originalState);

    expect(result.keychains.entities['w1-btc-mainnet']?.descriptor).toEqual(
      "[030b34f3/84'/0'/0']xpub1"
    );
    expect(result.keychains.entities['w1-btc-testnet']?.descriptor).toEqual(
      "[030b34f3/84'/1'/0']xpub2"
    );
    expect(result.keychains.entities['w1-btc-taproot']?.descriptor).toEqual(
      "[030b34f3/86'/0'/0']xpub3"
    );
    expect(result.keychains.entities['w1-stacks']?.descriptor).toEqual(
      "[030b34f3/44'/5757'/0']xpub4"
    );
    expect(result.keychains.entities['w2-btc-mainnet']?.descriptor).toEqual(
      "[0abcdef1/84'/0'/0']xpub5"
    );
    expect(result.keychains.entities['w2-btc-testnet']?.descriptor).toEqual(
      "[0abcdef1/84'/1'/0']xpub6"
    );
  });
});
