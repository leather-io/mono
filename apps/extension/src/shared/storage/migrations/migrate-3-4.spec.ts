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
});
