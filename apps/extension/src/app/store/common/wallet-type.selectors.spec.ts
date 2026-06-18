import { describe, expect, test } from 'vitest';

import { migrateToAccountsSlice } from '@shared/storage/migrations/migrate-3-4';

import { selectWalletAccountRefTree } from './wallet-type.selectors';

const softwareFingerprint = 'a1b2c3d4';
const ledgerFingerprint = 'e5f6a7b8';

type RefTreeInputs = Parameters<typeof selectWalletAccountRefTree.resultFunc>;

describe('selectWalletAccountRefTree', () => {
  test('falls back to one account (no RangeError) when a software wallet lacks highestAccountIndex', () => {
    const walletEntities = {
      [softwareFingerprint]: {
        fingerprint: softwareFingerprint,
        name: 'Wallet 1',
        type: 'software',
        createdOn: null,
      },
    } as unknown as RefTreeInputs[0];
    // Entry present but missing highestAccountIndex — the legacy/corrupt state
    // that previously produced NaN -> createNullArrayOfLength(NaN) -> RangeError.
    const stxChain = {
      [softwareFingerprint]: { currentAccountStacksDescriptor: '' },
    } as unknown as RefTreeInputs[1];

    const tree = selectWalletAccountRefTree.resultFunc(walletEntities, stxChain, [], []);

    expect(tree).toHaveLength(1);
    expect(tree[0].accounts).toHaveLength(1);
  });

  test('falls back to one account (no RangeError) for a fractional highestAccountIndex', () => {
    const walletEntities = {
      [softwareFingerprint]: {
        fingerprint: softwareFingerprint,
        name: 'Wallet 1',
        type: 'software',
        createdOn: null,
      },
    } as unknown as RefTreeInputs[0];
    const stxChain = {
      [softwareFingerprint]: { highestAccountIndex: 2.5, currentAccountStacksDescriptor: '' },
    } as unknown as RefTreeInputs[1];

    const tree = selectWalletAccountRefTree.resultFunc(walletEntities, stxChain, [], []);

    expect(tree).toHaveLength(1);
    expect(tree[0].accounts).toHaveLength(1);
  });

  test('skips a malformed ledger descriptor instead of throwing in render', () => {
    const walletEntities = {
      [ledgerFingerprint]: {
        fingerprint: ledgerFingerprint,
        name: 'My Ledger',
        type: 'ledger',
        createdOn: null,
      },
    } as unknown as RefTreeInputs[0];
    const bitcoinKeychains = [
      { chain: 'bitcoin', descriptor: `[${ledgerFingerprint}/84']xpub` },
      { chain: 'bitcoin', descriptor: `[${ledgerFingerprint}/84'/0'/0']xpub0` },
    ] as unknown as RefTreeInputs[2];

    const tree = selectWalletAccountRefTree.resultFunc(
      walletEntities,
      {} as unknown as RefTreeInputs[1],
      bitcoinKeychains,
      [] as unknown as RefTreeInputs[3]
    );

    expect(tree[0].accounts).toHaveLength(1);
  });

  test('agrees with the 3->4 migration on materialized account ids', () => {
    const inputState = {
      wallets: {
        ids: [softwareFingerprint, ledgerFingerprint],
        entities: {
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
        },
      },
      chains: { stx: { [softwareFingerprint]: { highestAccountIndex: 2 } } },
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

    const bitcoinKeychains = [
      { chain: 'bitcoin', descriptor: `[${ledgerFingerprint}/84'/0'/0']xpub0` },
      { chain: 'bitcoin', descriptor: `[${ledgerFingerprint}/84'/0'/1']xpub1` },
    ];
    const tree = selectWalletAccountRefTree.resultFunc(
      migrated.wallets.entities as unknown as RefTreeInputs[0],
      migrated.chains.stx as unknown as RefTreeInputs[1],
      bitcoinKeychains as unknown as RefTreeInputs[2],
      [] as unknown as RefTreeInputs[3]
    );
    const treeIds = tree.flatMap(wallet =>
      wallet.accounts.map(account => `${account.fingerprint}/${account.accountIndex}`)
    );

    expect(new Set(treeIds)).toEqual(new Set(migrated.accounts.ids));
  });
});
