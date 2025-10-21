import { describe, expect, test } from 'vitest';

import { migrateFlattenKeychains } from './migrate-0-1-flatten-keychains';

describe('migrateFlattenKeychains', () => {
  test('should flatten bitcoin and stacks keychains into a single entity structure', () => {
    const originalState = {
      _persist: { version: 0, rehydrated: true },
      keychains: {
        bitcoin: {
          ids: ['btc-key-1', 'btc-key-2'],
          entities: {
            'btc-key-1': { descriptor: 'btc-descriptor-1' },
            'btc-key-2': { descriptor: 'btc-descriptor-2' },
          },
        },
        stacks: {
          ids: ['stx-key-1', 'stx-key-2'],
          entities: {
            'stx-key-1': { descriptor: 'stx-descriptor-1' },
            'stx-key-2': { descriptor: 'stx-descriptor-2' },
          },
        },
      },
      otherState: { someValue: 'preserved' },
    };

    const result = migrateFlattenKeychains(originalState);

    expect(result).toEqual({
      _persist: { version: 0, rehydrated: true },
      keychains: {
        ids: ['btc-key-1', 'btc-key-2', 'stx-key-1', 'stx-key-2'],
        entities: {
          'btc-key-1': { descriptor: 'btc-descriptor-1', chain: 'bitcoin' },
          'btc-key-2': { descriptor: 'btc-descriptor-2', chain: 'bitcoin' },
          'stx-key-1': { descriptor: 'stx-descriptor-1', chain: 'stacks' },
          'stx-key-2': { descriptor: 'stx-descriptor-2', chain: 'stacks' },
        },
      },
      otherState: { someValue: 'preserved' },
    });
  });

  test('should preserve other state properties unchanged', () => {
    const originalState = {
      _persist: { version: 0, rehydrated: true },
      keychains: {
        bitcoin: { ids: [], entities: {} },
        stacks: { ids: [], entities: {} },
      },
      user: { id: '123', name: 'Test User' },
      settings: { theme: 'dark', notifications: true },
      accounts: { active: 'account-1' },
    };

    const result = migrateFlattenKeychains(originalState) as any;

    expect(result.user).toEqual({ id: '123', name: 'Test User' });
    expect(result.settings).toEqual({ theme: 'dark', notifications: true });
    expect(result.accounts).toEqual({ active: 'account-1' });
    expect(result._persist).toEqual({ version: 0, rehydrated: true });
  });

  test('should handle empty bitcoin keychains', () => {
    const originalState = {
      _persist: { version: 0, rehydrated: true },
      keychains: {
        bitcoin: { ids: [], entities: {} },
        stacks: {
          ids: ['stx-key-1'],
          entities: {
            'stx-key-1': { descriptor: 'stx-descriptor-1' },
          },
        },
      },
    };

    const result = migrateFlattenKeychains(originalState);

    expect(result.keychains.ids).toEqual(['stx-key-1']);
    expect(result.keychains.entities).toEqual({
      'stx-key-1': {
        descriptor: 'stx-descriptor-1',
        chain: 'stacks',
      },
    });
  });

  test('should handle empty stacks keychains', () => {
    const originalState = {
      _persist: { version: 0, rehydrated: true },
      keychains: {
        bitcoin: {
          ids: ['btc-key-1'],
          entities: {
            'btc-key-1': { descriptor: 'btc-descriptor-1' },
          },
        },
        stacks: { ids: [], entities: {} },
      },
    };

    const result = migrateFlattenKeychains(originalState);

    expect(result.keychains.ids).toEqual(['btc-key-1']);
    expect(result.keychains.entities).toEqual({
      'btc-key-1': { descriptor: 'btc-descriptor-1', chain: 'bitcoin' },
    });
  });

  test('should handle completely empty keychains', () => {
    const originalState = {
      _persist: { version: 0, rehydrated: true },
      keychains: {
        bitcoin: { ids: [], entities: {} },
        stacks: { ids: [], entities: {} },
      },
      otherData: 'preserved',
    };

    const result = migrateFlattenKeychains(originalState) as any;

    expect(result.keychains.ids).toEqual([]);
    expect(result.keychains.entities).toEqual({});
    expect(result.otherData).toBe('preserved');
  });

  test('should correctly add chain property to bitcoin entities', () => {
    const originalState = {
      _persist: { version: 0, rehydrated: true },
      keychains: {
        bitcoin: {
          ids: ['btc-key-1'],
          entities: {
            'btc-key-1': {
              descriptor: 'complex-descriptor',
              metadata: { created: '2023-01-01' },
              settings: { autoLock: true },
            },
          },
        },
        stacks: { ids: [], entities: {} },
      },
    };

    const result = migrateFlattenKeychains(originalState);

    expect(result.keychains.entities['btc-key-1']).toEqual({
      descriptor: 'complex-descriptor',
      metadata: { created: '2023-01-01' },
      settings: { autoLock: true },
      chain: 'bitcoin',
    });
  });

  test('should correctly add chain property to stacks entities', () => {
    const originalState = {
      _persist: { version: 0, rehydrated: true },
      keychains: {
        bitcoin: { ids: [], entities: {} },
        stacks: {
          ids: ['stx-key-1'],
          entities: {
            'stx-key-1': { descriptor: 'stacks-descriptor' },
          },
        },
      },
    };

    const result = migrateFlattenKeychains(originalState);

    expect(result.keychains.entities['stx-key-1']).toEqual({
      descriptor: 'stacks-descriptor',
      chain: 'stacks',
    });
  });

  test('should preserve original entity properties while adding chain', () => {
    const originalState = {
      _persist: { version: 0, rehydrated: true },
      keychains: {
        bitcoin: {
          ids: ['btc-1'],
          entities: {
            'btc-1': {
              descriptor: 'test',
              existingChain: 'bitcoin-testnet', // This should be preserved
              nested: { deep: { value: 42 } },
            },
          },
        },
        stacks: {
          ids: ['stx-1'],
          entities: {
            'stx-1': {
              descriptor: 'test',
              chain: 'existing-chain-value', // This should be overwritten
            },
          },
        },
      },
    };

    const result = migrateFlattenKeychains(originalState);

    expect(result.keychains.entities['btc-1']).toEqual({
      descriptor: 'test',
      existingChain: 'bitcoin-testnet',
      nested: { deep: { value: 42 } },
      chain: 'bitcoin',
    });

    expect(result.keychains.entities['stx-1']).toEqual({
      descriptor: 'test',
      chain: 'stacks', // Should be overwritten
    });
  });

  test('should maintain correct order of ids (bitcoin first, then stacks)', () => {
    const originalState = {
      _persist: { version: 0, rehydrated: true },
      keychains: {
        bitcoin: {
          ids: ['btc-3', 'btc-1', 'btc-2'],
          entities: {
            'btc-3': { descriptor: 'btc-3' },
            'btc-1': { descriptor: 'btc-1' },
            'btc-2': { descriptor: 'btc-2' },
          },
        },
        stacks: {
          ids: ['stx-z', 'stx-a', 'stx-m'],
          entities: {
            'stx-z': { descriptor: 'stx-z' },
            'stx-a': { descriptor: 'stx-a' },
            'stx-m': { descriptor: 'stx-m' },
          },
        },
      },
    };

    const result = migrateFlattenKeychains(originalState);
    expect(result.keychains.ids).toEqual(['btc-3', 'btc-1', 'btc-2', 'stx-z', 'stx-a', 'stx-m']);
  });
});
