import { describe, expect, test } from 'vitest';

import { migrateToAccountsSlice } from '@shared/storage/migrations/migrate-3-4';

import { selectWalletAccountRefTree } from './wallet-type.selectors';

const softwareFingerprint = 'a1b2c3d4';
const ledgerFingerprint = 'e5f6a7b8';

type RefTreeInputs = Parameters<typeof selectWalletAccountRefTree.resultFunc>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getAtPath(value: unknown, ...keys: string[]): unknown {
  return keys.reduce<unknown>(
    (current, key) => (isRecord(current) ? current[key] : undefined),
    value
  );
}

function toUnknownArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

describe('selectWalletAccountRefTree', () => {
  test('falls back to one account (no RangeError) when a software wallet lacks highestAccountIndex', () => {
    const walletEntities: RefTreeInputs[0] = {
      [softwareFingerprint]: {
        fingerprint: softwareFingerprint,
        name: 'Wallet 1',
        type: 'software',
        createdOn: null,
      },
    };
    // Entry present but missing highestAccountIndex — the legacy/corrupt state
    // that previously produced NaN -> createNullArrayOfLength(NaN) -> RangeError.
    const stxChainEntry = { highestAccountIndex: 0, currentAccountStacksDescriptor: '' };
    Reflect.deleteProperty(stxChainEntry, 'highestAccountIndex');
    const stxChain: RefTreeInputs[1] = {
      [softwareFingerprint]: stxChainEntry,
    };

    const tree = selectWalletAccountRefTree.resultFunc(walletEntities, stxChain, [], []);

    expect(tree).toHaveLength(1);
    expect(tree[0].accounts).toHaveLength(1);
  });

  test('falls back to one account (no RangeError) for a fractional highestAccountIndex', () => {
    const walletEntities: RefTreeInputs[0] = {
      [softwareFingerprint]: {
        fingerprint: softwareFingerprint,
        name: 'Wallet 1',
        type: 'software',
        createdOn: null,
      },
    };
    const stxChain: RefTreeInputs[1] = {
      [softwareFingerprint]: { highestAccountIndex: 2.5, currentAccountStacksDescriptor: '' },
    };

    const tree = selectWalletAccountRefTree.resultFunc(walletEntities, stxChain, [], []);

    expect(tree).toHaveLength(1);
    expect(tree[0].accounts).toHaveLength(1);
  });

  test('skips a malformed ledger descriptor instead of throwing in render', () => {
    const walletEntities: RefTreeInputs[0] = {
      [ledgerFingerprint]: {
        fingerprint: ledgerFingerprint,
        name: 'My Ledger',
        type: 'ledger',
        createdOn: null,
      },
    };
    const bitcoinKeychains: RefTreeInputs[2] = [
      { chain: 'bitcoin', descriptor: `[${ledgerFingerprint}/84']xpub` },
      { chain: 'bitcoin', descriptor: `[${ledgerFingerprint}/84'/0'/0']xpub0` },
    ];

    const tree = selectWalletAccountRefTree.resultFunc(walletEntities, {}, bitcoinKeychains, []);

    expect(tree[0].accounts).toHaveLength(1);
  });

  test('agrees with the 3->4 migration on materialized account ids', () => {
    const walletEntities: RefTreeInputs[0] = {
      [softwareFingerprint]: {
        fingerprint: softwareFingerprint,
        name: 'Wallet 1',
        type: 'software',
        createdOn: null,
      },
      [ledgerFingerprint]: {
        fingerprint: ledgerFingerprint,
        name: 'My Ledger',
        type: 'ledger',
        createdOn: null,
      },
    };
    const stxChain = { [softwareFingerprint]: { highestAccountIndex: 2 } };
    const inputState = {
      wallets: {
        ids: [softwareFingerprint, ledgerFingerprint],
        entities: walletEntities,
      },
      chains: { stx: stxChain },
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

    const migrated = migrateToAccountsSlice(inputState);

    expect(getAtPath(migrated, 'wallets', 'entities')).toEqual(walletEntities);
    const migratedStxChain: RefTreeInputs[1] = {
      [softwareFingerprint]: {
        ...stxChain[softwareFingerprint],
        currentAccountStacksDescriptor: '',
      },
    };
    expect(getAtPath(migrated, 'chains', 'stx')).toEqual(migratedStxChain);

    const bitcoinKeychains: RefTreeInputs[2] = [
      { chain: 'bitcoin', descriptor: `[${ledgerFingerprint}/84'/0'/0']xpub0` },
      { chain: 'bitcoin', descriptor: `[${ledgerFingerprint}/84'/0'/1']xpub1` },
    ];
    const tree = selectWalletAccountRefTree.resultFunc(
      walletEntities,
      migratedStxChain,
      bitcoinKeychains,
      []
    );
    const treeIds = tree.flatMap(wallet =>
      wallet.accounts.map(account => `${account.fingerprint}/${account.accountIndex}`)
    );

    expect(new Set(treeIds)).toEqual(
      new Set(toUnknownArray(getAtPath(migrated, 'accounts', 'ids')))
    );
  });
});
