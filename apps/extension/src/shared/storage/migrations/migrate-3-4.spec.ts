import { describe, expect, test } from 'vitest';

import { migrateToAccountsSlice } from './migrate-3-4';

const softwareFingerprint = 'a1b2c3d4';
const ledgerFingerprint = 'e5f6a7b8';

describe(migrateToAccountsSlice.name, () => {
  test('materializes an account entity per software wallet account index', () => {
    const inputState = {
      wallets: {
        ids: [softwareFingerprint],
        entities: {
          [softwareFingerprint]: { fingerprint: softwareFingerprint, type: 'software' },
        },
      },
      chains: { stx: { [softwareFingerprint]: { highestAccountIndex: 2 } } },
      settings: {},
    };

    const result = migrateToAccountsSlice(inputState);

    expect(result.accounts.ids).toEqual([
      `${softwareFingerprint}/0`,
      `${softwareFingerprint}/1`,
      `${softwareFingerprint}/2`,
    ]);
    expect(result.accounts.entities[`${softwareFingerprint}/0`]).toEqual({
      id: `${softwareFingerprint}/0`,
    });
  });

  test('leaves the settings slice untouched', () => {
    const inputState = {
      wallets: { ids: [], entities: {} },
      chains: { stx: {} },
      settings: { userSelectedTheme: 'system', dismissedMessages: [] },
    };

    const result = migrateToAccountsSlice(inputState);

    expect(result.settings).toEqual({ userSelectedTheme: 'system', dismissedMessages: [] });
    expect(result.accounts).toEqual({ ids: [], entities: {} });
  });

  test('derives Ledger wallet account count from its keychains', () => {
    const inputState = {
      wallets: {
        ids: [ledgerFingerprint],
        entities: { [ledgerFingerprint]: { fingerprint: ledgerFingerprint, type: 'ledger' } },
      },
      chains: { stx: {} },
      keychains: {
        ids: [`${ledgerFingerprint}/84'/0'/0'`, `${ledgerFingerprint}/84'/0'/1'`],
        entities: {
          [`${ledgerFingerprint}/84'/0'/0'`]: {
            chain: 'bitcoin',
            descriptor: `[${ledgerFingerprint}/84'/0'/0']xpub0`,
          },
          [`${ledgerFingerprint}/84'/0'/1'`]: {
            chain: 'bitcoin',
            descriptor: `[${ledgerFingerprint}/84'/0'/1']xpub1`,
          },
        },
      },
      settings: {},
    };

    const result = migrateToAccountsSlice(inputState);

    expect(result.accounts.ids).toEqual([`${ledgerFingerprint}/0`, `${ledgerFingerprint}/1`]);
  });

  test('skips Ledger keychains with malformed descriptors instead of throwing', () => {
    const inputState = {
      wallets: {
        ids: [ledgerFingerprint],
        entities: { [ledgerFingerprint]: { fingerprint: ledgerFingerprint, type: 'ledger' } },
      },
      chains: { stx: {} },
      keychains: {
        ids: ['malformed', `${ledgerFingerprint}/84'/0'/0'`],
        entities: {
          malformed: { chain: 'bitcoin', descriptor: `[${ledgerFingerprint}/84']xpub` },
          [`${ledgerFingerprint}/84'/0'/0'`]: {
            chain: 'bitcoin',
            descriptor: `[${ledgerFingerprint}/84'/0'/0']xpub0`,
          },
        },
      },
      settings: {},
    };

    expect(() => migrateToAccountsSlice(inputState)).not.toThrow();
    expect(migrateToAccountsSlice(inputState).accounts.ids).toEqual([`${ledgerFingerprint}/0`]);
  });

  test('falls back to a single account when no index information exists', () => {
    const inputState = {
      wallets: {
        ids: [softwareFingerprint],
        entities: {
          [softwareFingerprint]: { fingerprint: softwareFingerprint, type: 'software' },
        },
      },
      chains: { stx: {} },
      settings: {},
    };

    const result = migrateToAccountsSlice(inputState);

    expect(result.accounts.ids).toEqual([`${softwareFingerprint}/0`]);
  });

  test('derives a stacks-only Ledger wallet account count from its stacks keychains', () => {
    const inputState = {
      wallets: {
        ids: [ledgerFingerprint],
        entities: { [ledgerFingerprint]: { fingerprint: ledgerFingerprint, type: 'ledger' } },
      },
      chains: { stx: {} },
      keychains: {
        ids: [
          `${ledgerFingerprint}/44'/5757'/0'/0/0`,
          `${ledgerFingerprint}/44'/5757'/0'/0/1`,
          `${ledgerFingerprint}/44'/5757'/0'/0/2`,
        ],
        entities: {
          [`${ledgerFingerprint}/44'/5757'/0'/0/0`]: {
            chain: 'stacks',
            descriptor: `[${ledgerFingerprint}/44'/5757'/0'/0/0]stxpub0`,
          },
          [`${ledgerFingerprint}/44'/5757'/0'/0/1`]: {
            chain: 'stacks',
            descriptor: `[${ledgerFingerprint}/44'/5757'/0'/0/1]stxpub1`,
          },
          [`${ledgerFingerprint}/44'/5757'/0'/0/2`]: {
            chain: 'stacks',
            descriptor: `[${ledgerFingerprint}/44'/5757'/0'/0/2]stxpub2`,
          },
        },
      },
      settings: {},
    };

    const result = migrateToAccountsSlice(inputState);

    expect(result.accounts.ids).toEqual([
      `${ledgerFingerprint}/0`,
      `${ledgerFingerprint}/1`,
      `${ledgerFingerprint}/2`,
    ]);
  });

  test('materializes accounts for both a software and a Ledger wallet', () => {
    const inputState = {
      wallets: {
        ids: [softwareFingerprint, ledgerFingerprint],
        entities: {
          [softwareFingerprint]: { fingerprint: softwareFingerprint, type: 'software' },
          [ledgerFingerprint]: { fingerprint: ledgerFingerprint, type: 'ledger' },
        },
      },
      chains: { stx: { [softwareFingerprint]: { highestAccountIndex: 1 } } },
      keychains: {
        ids: [`${ledgerFingerprint}/84'/0'/0'`],
        entities: {
          [`${ledgerFingerprint}/84'/0'/0'`]: {
            chain: 'bitcoin',
            descriptor: `[${ledgerFingerprint}/84'/0'/0']xpub0`,
          },
        },
      },
      settings: {},
    };

    const result = migrateToAccountsSlice(inputState);

    expect(result.accounts.ids).toEqual([
      `${softwareFingerprint}/0`,
      `${softwareFingerprint}/1`,
      `${ledgerFingerprint}/0`,
    ]);
  });

  test('materializes accounts for multiple software wallets independently', () => {
    const secondSoftwareFingerprint = 'c3d4e5f6';
    const inputState = {
      wallets: {
        ids: [softwareFingerprint, secondSoftwareFingerprint],
        entities: {
          [softwareFingerprint]: { fingerprint: softwareFingerprint, type: 'software' },
          [secondSoftwareFingerprint]: {
            fingerprint: secondSoftwareFingerprint,
            type: 'software',
          },
        },
      },
      chains: {
        stx: {
          [softwareFingerprint]: { highestAccountIndex: 2 },
          [secondSoftwareFingerprint]: { highestAccountIndex: 0 },
        },
      },
      settings: {},
    };

    const result = migrateToAccountsSlice(inputState);

    expect(result.accounts.ids).toEqual([
      `${softwareFingerprint}/0`,
      `${softwareFingerprint}/1`,
      `${softwareFingerprint}/2`,
      `${secondSoftwareFingerprint}/0`,
    ]);
  });

  test('skips wallet entities without a fingerprint', () => {
    const inputState = {
      wallets: {
        ids: ['orphan', softwareFingerprint],
        entities: {
          orphan: { type: 'software' },
          [softwareFingerprint]: { fingerprint: softwareFingerprint, type: 'software' },
        },
      },
      chains: { stx: { [softwareFingerprint]: { highestAccountIndex: 0 } } },
      settings: {},
    };

    const result = migrateToAccountsSlice(inputState);

    expect(result.accounts.ids).toEqual([`${softwareFingerprint}/0`]);
  });

  test('preserves existing account metadata for derived ids and drops stale ones', () => {
    const inputState = {
      wallets: {
        ids: [softwareFingerprint],
        entities: {
          [softwareFingerprint]: { fingerprint: softwareFingerprint, type: 'software' },
        },
      },
      chains: { stx: { [softwareFingerprint]: { highestAccountIndex: 1 } } },
      accounts: {
        ids: [`${softwareFingerprint}/0`, 'stale/0'],
        entities: {
          [`${softwareFingerprint}/0`]: {
            id: `${softwareFingerprint}/0`,
            name: 'Custom name',
            status: 'hidden',
          },
          'stale/0': { id: 'stale/0', name: 'Orphaned' },
        },
      },
      settings: {},
    };

    const result = migrateToAccountsSlice(inputState);

    expect(result.accounts.ids).toEqual([`${softwareFingerprint}/0`, `${softwareFingerprint}/1`]);
    expect(result.accounts.entities['stale/0']).toBeUndefined();
    expect(result.accounts.entities[`${softwareFingerprint}/0`]).toEqual({
      id: `${softwareFingerprint}/0`,
      name: 'Custom name',
      status: 'hidden',
    });
    expect(result.accounts.entities[`${softwareFingerprint}/1`]).toEqual({
      id: `${softwareFingerprint}/1`,
    });
  });

  test('preserves account metadata when re-run on an already-migrated state', () => {
    const migratedState = {
      wallets: {
        ids: [softwareFingerprint],
        entities: {
          [softwareFingerprint]: { fingerprint: softwareFingerprint, type: 'software' },
        },
      },
      chains: { stx: { [softwareFingerprint]: { highestAccountIndex: 1 } } },
      accounts: {
        ids: [`${softwareFingerprint}/0`, `${softwareFingerprint}/1`],
        entities: {
          [`${softwareFingerprint}/0`]: {
            id: `${softwareFingerprint}/0`,
            name: 'Named',
            status: 'hidden',
          },
          [`${softwareFingerprint}/1`]: { id: `${softwareFingerprint}/1` },
        },
      },
      settings: {},
    };

    const result = migrateToAccountsSlice(migratedState);

    expect(result.accounts).toEqual(migratedState.accounts);
  });

  test('ignores keychain entities absent from the keychains ids list', () => {
    const inputState = {
      wallets: {
        ids: [ledgerFingerprint],
        entities: { [ledgerFingerprint]: { fingerprint: ledgerFingerprint, type: 'ledger' } },
      },
      chains: { stx: {} },
      keychains: {
        ids: [`${ledgerFingerprint}/84'/0'/0'`],
        entities: {
          [`${ledgerFingerprint}/84'/0'/0'`]: {
            chain: 'bitcoin',
            descriptor: `[${ledgerFingerprint}/84'/0'/0']xpub0`,
          },
          [`${ledgerFingerprint}/84'/0'/1'`]: {
            chain: 'bitcoin',
            descriptor: `[${ledgerFingerprint}/84'/0'/1']xpub1`,
          },
        },
      },
      settings: {},
    };

    const result = migrateToAccountsSlice(inputState);

    expect(result.accounts.ids).toEqual([`${ledgerFingerprint}/0`]);
  });

  test('is idempotent when re-run on an already-migrated state', () => {
    const inputState = {
      wallets: {
        ids: [softwareFingerprint],
        entities: {
          [softwareFingerprint]: { fingerprint: softwareFingerprint, type: 'software' },
        },
      },
      chains: { stx: { [softwareFingerprint]: { highestAccountIndex: 2 } } },
      settings: {},
    };

    const once = migrateToAccountsSlice(inputState);
    const twice = migrateToAccountsSlice(once);

    expect(twice.accounts).toEqual(once.accounts);
  });

  test('produces an empty accounts slice when wallets is undefined', () => {
    const inputState = { settings: {} };

    const result = migrateToAccountsSlice(inputState);

    expect(result.accounts).toEqual({ ids: [], entities: {} });
  });

  test('repairs a missing highestAccountIndex from the legacy currentAccountIndex', () => {
    const inputState = {
      wallets: {
        ids: [softwareFingerprint],
        entities: {
          [softwareFingerprint]: { fingerprint: softwareFingerprint, type: 'software' },
        },
      },
      chains: { stx: { [softwareFingerprint]: { currentAccountIndex: 2 } } },
      settings: {},
    };

    const result = migrateToAccountsSlice(inputState);

    expect(result.accounts.ids).toEqual([
      `${softwareFingerprint}/0`,
      `${softwareFingerprint}/1`,
      `${softwareFingerprint}/2`,
    ]);
    expect(result.chains.stx[softwareFingerprint].highestAccountIndex).toBe(2);
  });

  test('repairs a missing highestAccountIndex from the active account index', () => {
    const inputState = {
      wallets: {
        ids: [softwareFingerprint],
        entities: {
          [softwareFingerprint]: { fingerprint: softwareFingerprint, type: 'software' },
        },
      },
      chains: { stx: { [softwareFingerprint]: { currentAccountStacksDescriptor: '' } } },
      active: { account: { fingerprint: softwareFingerprint, accountIndex: 2 } },
      settings: {},
    };

    const result = migrateToAccountsSlice(inputState);

    expect(result.accounts.ids).toEqual([
      `${softwareFingerprint}/0`,
      `${softwareFingerprint}/1`,
      `${softwareFingerprint}/2`,
    ]);
    expect(result.chains.stx[softwareFingerprint].highestAccountIndex).toBe(2);
  });

  test('creates a chains.stx entry and repairs from the active index when none exists', () => {
    const inputState = {
      wallets: {
        ids: [softwareFingerprint],
        entities: {
          [softwareFingerprint]: { fingerprint: softwareFingerprint, type: 'software' },
        },
      },
      chains: { stx: {} },
      active: { account: { fingerprint: softwareFingerprint, accountIndex: 3 } },
      settings: {},
    };

    const result = migrateToAccountsSlice(inputState);

    expect(result.accounts.ids).toEqual([
      `${softwareFingerprint}/0`,
      `${softwareFingerprint}/1`,
      `${softwareFingerprint}/2`,
      `${softwareFingerprint}/3`,
    ]);
    expect(result.chains.stx[softwareFingerprint]).toEqual({
      highestAccountIndex: 3,
      currentAccountStacksDescriptor: '',
    });
  });

  test('does not apply the active index to a wallet other than the active one', () => {
    const secondSoftwareFingerprint = 'c3d4e5f6';
    const inputState = {
      wallets: {
        ids: [softwareFingerprint, secondSoftwareFingerprint],
        entities: {
          [softwareFingerprint]: { fingerprint: softwareFingerprint, type: 'software' },
          [secondSoftwareFingerprint]: {
            fingerprint: secondSoftwareFingerprint,
            type: 'software',
          },
        },
      },
      chains: {
        stx: {
          [softwareFingerprint]: { currentAccountStacksDescriptor: '' },
          [secondSoftwareFingerprint]: { currentAccountStacksDescriptor: '' },
        },
      },
      active: { account: { fingerprint: secondSoftwareFingerprint, accountIndex: 2 } },
      settings: {},
    };

    const result = migrateToAccountsSlice(inputState);

    expect(result.chains.stx[softwareFingerprint].highestAccountIndex).toBe(0);
    expect(result.chains.stx[secondSoftwareFingerprint].highestAccountIndex).toBe(2);
    expect(result.accounts.ids).toEqual([
      `${softwareFingerprint}/0`,
      `${secondSoftwareFingerprint}/0`,
      `${secondSoftwareFingerprint}/1`,
      `${secondSoftwareFingerprint}/2`,
    ]);
  });

  test('never lowers an existing valid highestAccountIndex', () => {
    const inputState = {
      wallets: {
        ids: [softwareFingerprint],
        entities: {
          [softwareFingerprint]: { fingerprint: softwareFingerprint, type: 'software' },
        },
      },
      chains: {
        stx: { [softwareFingerprint]: { highestAccountIndex: 5, currentAccountIndex: 2 } },
      },
      settings: {},
    };

    const result = migrateToAccountsSlice(inputState);

    expect(result.chains.stx[softwareFingerprint].highestAccountIndex).toBe(5);
    expect(result.accounts.ids).toHaveLength(6);
  });

  test('leaves chains.stx untouched for ledger wallets', () => {
    const inputState = {
      wallets: {
        ids: [ledgerFingerprint],
        entities: { [ledgerFingerprint]: { fingerprint: ledgerFingerprint, type: 'ledger' } },
      },
      chains: { stx: {} },
      keychains: {
        ids: [`${ledgerFingerprint}/84'/0'/0'`],
        entities: {
          [`${ledgerFingerprint}/84'/0'/0'`]: {
            chain: 'bitcoin',
            descriptor: `[${ledgerFingerprint}/84'/0'/0']xpub0`,
          },
        },
      },
      settings: {},
    };

    const result = migrateToAccountsSlice(inputState);

    expect(result.chains.stx).toEqual({});
    expect(result.accounts.ids).toEqual([`${ledgerFingerprint}/0`]);
  });

  test('is idempotent when re-run after repairing a missing highestAccountIndex', () => {
    const inputState = {
      wallets: {
        ids: [softwareFingerprint],
        entities: {
          [softwareFingerprint]: { fingerprint: softwareFingerprint, type: 'software' },
        },
      },
      chains: { stx: { [softwareFingerprint]: { currentAccountIndex: 2 } } },
      settings: {},
    };

    const once = migrateToAccountsSlice(inputState);
    const twice = migrateToAccountsSlice(once);

    expect(twice.accounts).toEqual(once.accounts);
    expect(twice.chains.stx).toEqual(once.chains.stx);
  });

  test('materializes assumed-zero-fingerprint ids for a stacks-only Ledger and preserves metadata', () => {
    const assumedZero = '00000000';
    const inputState = {
      wallets: {
        ids: [assumedZero],
        entities: { [assumedZero]: { fingerprint: assumedZero, type: 'ledger' } },
      },
      chains: { stx: {} },
      keychains: {
        ids: [`${assumedZero}/44'/5757'/0'/0/0`, `${assumedZero}/44'/5757'/0'/0/1`],
        entities: {
          [`${assumedZero}/44'/5757'/0'/0/0`]: {
            chain: 'stacks',
            descriptor: `[${assumedZero}/44'/5757'/0'/0/0]stxpub0`,
          },
          [`${assumedZero}/44'/5757'/0'/0/1`]: {
            chain: 'stacks',
            descriptor: `[${assumedZero}/44'/5757'/0'/0/1]stxpub1`,
          },
        },
      },
      accounts: {
        ids: [`${assumedZero}/0`],
        entities: {
          [`${assumedZero}/0`]: {
            id: `${assumedZero}/0`,
            name: 'My Stacks Acct',
            status: 'hidden',
          },
        },
      },
      settings: {},
    };

    const result = migrateToAccountsSlice(inputState);

    expect(result.accounts.ids).toEqual([`${assumedZero}/0`, `${assumedZero}/1`]);
    expect(result.accounts.entities[`${assumedZero}/0`]).toEqual({
      id: `${assumedZero}/0`,
      name: 'My Stacks Acct',
      status: 'hidden',
    });
  });

  test('materializes contiguous Ledger bitcoin indices from 0', () => {
    const inputState = {
      wallets: {
        ids: [ledgerFingerprint],
        entities: { [ledgerFingerprint]: { fingerprint: ledgerFingerprint, type: 'ledger' } },
      },
      chains: { stx: {} },
      keychains: {
        ids: [
          `${ledgerFingerprint}/84'/0'/0'`,
          `${ledgerFingerprint}/84'/0'/1'`,
          `${ledgerFingerprint}/84'/0'/2'`,
        ],
        entities: {
          [`${ledgerFingerprint}/84'/0'/0'`]: {
            chain: 'bitcoin',
            descriptor: `[${ledgerFingerprint}/84'/0'/0']xpub0`,
          },
          [`${ledgerFingerprint}/84'/0'/1'`]: {
            chain: 'bitcoin',
            descriptor: `[${ledgerFingerprint}/84'/0'/1']xpub1`,
          },
          [`${ledgerFingerprint}/84'/0'/2'`]: {
            chain: 'bitcoin',
            descriptor: `[${ledgerFingerprint}/84'/0'/2']xpub2`,
          },
        },
      },
      settings: {},
    };

    const result = migrateToAccountsSlice(inputState);

    expect(result.accounts.ids).toEqual([
      `${ledgerFingerprint}/0`,
      `${ledgerFingerprint}/1`,
      `${ledgerFingerprint}/2`,
    ]);
  });

  test('leaves a Ledger wallet with no matching keychains with zero accounts', () => {
    const inputState = {
      wallets: {
        ids: [ledgerFingerprint],
        entities: { [ledgerFingerprint]: { fingerprint: ledgerFingerprint, type: 'ledger' } },
      },
      chains: { stx: {} },
      keychains: { ids: [], entities: {} },
      settings: {},
    };

    expect(() => migrateToAccountsSlice(inputState)).not.toThrow();
    const result = migrateToAccountsSlice(inputState);
    expect(result.accounts.ids).toEqual([]);
    expect(result.wallets.entities[ledgerFingerprint]).toBeDefined();
  });

  test('repairs an active account that is not materialized to the wallets first account', () => {
    const inputState = {
      wallets: {
        ids: [ledgerFingerprint],
        entities: { [ledgerFingerprint]: { fingerprint: ledgerFingerprint, type: 'ledger' } },
      },
      chains: { stx: {} },
      keychains: {
        ids: [`${ledgerFingerprint}/84'/0'/0'`],
        entities: {
          [`${ledgerFingerprint}/84'/0'/0'`]: {
            chain: 'bitcoin',
            descriptor: `[${ledgerFingerprint}/84'/0'/0']xpub0`,
          },
        },
      },
      active: { account: { fingerprint: ledgerFingerprint, accountIndex: 1 } },
      settings: {},
    };

    const result = migrateToAccountsSlice(inputState);

    expect(result.accounts.ids).toEqual([`${ledgerFingerprint}/0`]);
    expect(result.active.account).toEqual({ fingerprint: ledgerFingerprint, accountIndex: 0 });
  });

  test('leaves a materialized active account unchanged', () => {
    const inputState = {
      wallets: {
        ids: [softwareFingerprint],
        entities: {
          [softwareFingerprint]: { fingerprint: softwareFingerprint, type: 'software' },
        },
      },
      chains: { stx: { [softwareFingerprint]: { highestAccountIndex: 2 } } },
      active: { account: { fingerprint: softwareFingerprint, accountIndex: 1 } },
      settings: {},
    };

    const result = migrateToAccountsSlice(inputState);

    expect(result.active.account).toEqual({ fingerprint: softwareFingerprint, accountIndex: 1 });
  });

  test('scrubs the legacy currentAccountIndex field from chains.stx', () => {
    const inputState = {
      wallets: {
        ids: [softwareFingerprint],
        entities: {
          [softwareFingerprint]: { fingerprint: softwareFingerprint, type: 'software' },
        },
      },
      chains: {
        stx: {
          [softwareFingerprint]: {
            currentAccountIndex: 1,
            currentAccountStacksDescriptor: 'desc',
            highestAccountIndex: 1,
          },
        },
      },
      settings: {},
    };

    const result = migrateToAccountsSlice(inputState);

    expect(result.chains.stx[softwareFingerprint]).toEqual({
      currentAccountStacksDescriptor: 'desc',
      highestAccountIndex: 1,
    });
  });

  test('recovers the account count from existing accounts ids when the chain index is missing', () => {
    const inputState = {
      wallets: {
        ids: [softwareFingerprint],
        entities: {
          [softwareFingerprint]: { fingerprint: softwareFingerprint, type: 'software' },
        },
      },
      chains: { stx: { [softwareFingerprint]: { currentAccountStacksDescriptor: '' } } },
      accounts: {
        ids: [
          `${softwareFingerprint}/0`,
          `${softwareFingerprint}/1`,
          `${softwareFingerprint}/2`,
          `${softwareFingerprint}/3`,
          `${softwareFingerprint}/4`,
        ],
        entities: {
          [`${softwareFingerprint}/0`]: { id: `${softwareFingerprint}/0` },
          [`${softwareFingerprint}/1`]: { id: `${softwareFingerprint}/1` },
          [`${softwareFingerprint}/2`]: { id: `${softwareFingerprint}/2` },
          [`${softwareFingerprint}/3`]: { id: `${softwareFingerprint}/3` },
          [`${softwareFingerprint}/4`]: { id: `${softwareFingerprint}/4` },
        },
      },
      settings: {},
    };

    const result = migrateToAccountsSlice(inputState);

    expect(result.accounts.ids).toEqual([
      `${softwareFingerprint}/0`,
      `${softwareFingerprint}/1`,
      `${softwareFingerprint}/2`,
      `${softwareFingerprint}/3`,
      `${softwareFingerprint}/4`,
    ]);
    expect(result.chains.stx[softwareFingerprint].highestAccountIndex).toBe(4);
  });

  test('ignores wallet entities absent from the wallets ids list', () => {
    const inputState = {
      wallets: {
        ids: [softwareFingerprint],
        entities: {
          [softwareFingerprint]: { fingerprint: softwareFingerprint, type: 'software' },
          orphan: { fingerprint: 'deadbeef', type: 'software' },
        },
      },
      chains: {
        stx: {
          [softwareFingerprint]: { highestAccountIndex: 0 },
          deadbeef: { highestAccountIndex: 0 },
        },
      },
      settings: {},
    };

    const result = migrateToAccountsSlice(inputState);

    expect(result.accounts.ids).toEqual([`${softwareFingerprint}/0`]);
  });

  test('is idempotent for a ledger wallet', () => {
    const inputState = {
      wallets: {
        ids: [ledgerFingerprint],
        entities: { [ledgerFingerprint]: { fingerprint: ledgerFingerprint, type: 'ledger' } },
      },
      chains: { stx: {} },
      keychains: {
        ids: [`${ledgerFingerprint}/84'/0'/0'`, `${ledgerFingerprint}/84'/0'/1'`],
        entities: {
          [`${ledgerFingerprint}/84'/0'/0'`]: {
            chain: 'bitcoin',
            descriptor: `[${ledgerFingerprint}/84'/0'/0']xpub0`,
          },
          [`${ledgerFingerprint}/84'/0'/1'`]: {
            chain: 'bitcoin',
            descriptor: `[${ledgerFingerprint}/84'/0'/1']xpub1`,
          },
        },
      },
      settings: {},
    };

    const once = migrateToAccountsSlice(inputState);
    const twice = migrateToAccountsSlice(once);

    expect(twice.accounts).toEqual(once.accounts);
  });

  test('drops an unexpected status value while preserving active and hidden', () => {
    const inputState = {
      wallets: {
        ids: [softwareFingerprint],
        entities: {
          [softwareFingerprint]: { fingerprint: softwareFingerprint, type: 'software' },
        },
      },
      chains: { stx: { [softwareFingerprint]: { highestAccountIndex: 2 } } },
      accounts: {
        ids: [`${softwareFingerprint}/0`, `${softwareFingerprint}/1`, `${softwareFingerprint}/2`],
        entities: {
          [`${softwareFingerprint}/0`]: { id: `${softwareFingerprint}/0`, status: 'active' },
          [`${softwareFingerprint}/1`]: { id: `${softwareFingerprint}/1`, status: 'hidden' },
          [`${softwareFingerprint}/2`]: { id: `${softwareFingerprint}/2`, status: 'bogus' },
        },
      },
      settings: {},
    };

    const result = migrateToAccountsSlice(inputState);

    expect(result.accounts.entities[`${softwareFingerprint}/0`]).toEqual({
      id: `${softwareFingerprint}/0`,
      status: 'active',
    });
    expect(result.accounts.entities[`${softwareFingerprint}/1`]).toEqual({
      id: `${softwareFingerprint}/1`,
      status: 'hidden',
    });
    expect(result.accounts.entities[`${softwareFingerprint}/2`]).toEqual({
      id: `${softwareFingerprint}/2`,
    });
  });
});
