import { describe, expect, test } from 'vitest';

import type { RootState } from '@app/store';

import { migrateMultiWalletSupport } from './migrate-2-3';

const softwareWalletFingerprint = 'a1b2c3d4';
const ledgerBitcoinFingerprint = 'e5f6a7b8';
const assumedZeroFingerprint = '00000000';

describe(migrateMultiWalletSupport.name, () => {
  describe('software wallet', () => {
    test('migrates software wallet with Stacks descriptor', () => {
      const inputState = {
        softwareKeys: {
          ids: ['default'],
          entities: {
            default: {
              id: 'default',
              salt: 'test-salt-123',
              type: 'software',
            },
          },
        },
        chains: {
          stx: {
            default: {
              currentAccountIndex: 2,
              currentAccountStacksDescriptor: `[${softwareWalletFingerprint}/44'/5757'/0'/0/0]02abc123`,
            },
          },
        },
      } as unknown as RootState;

      const result = migrateMultiWalletSupport(inputState);

      expect(result.softwareKeys.salt).toEqual('test-salt-123');
      expect(result.softwareKeys.entities.default).toBeUndefined();
      expect(result.softwareKeys.entities[softwareWalletFingerprint]).toBeDefined();
      expect(result.softwareKeys.entities[softwareWalletFingerprint].id).toEqual(
        softwareWalletFingerprint
      );
      expect(result.softwareKeys.ids).toEqual([softwareWalletFingerprint]);

      expect(result.active).toEqual({
        account: {
          fingerprint: softwareWalletFingerprint,
          accountIndex: 2,
        },
      });

      expect(result.wallets.entities[softwareWalletFingerprint]).toEqual({
        fingerprint: softwareWalletFingerprint,
        name: 'Wallet 1',
        type: 'software',
        createdOn: null,
      });
      expect(result.wallets.ids).toEqual([softwareWalletFingerprint]);

      expect(result.chains.stx[softwareWalletFingerprint]).toBeDefined();
      expect(result.chains.stx.default).toBeUndefined();
    });

    test('migrates software wallet with default account index', () => {
      const inputState = {
        softwareKeys: {
          ids: ['default'],
          entities: {
            default: {
              id: 'default',
              salt: 'test-salt-456',
              type: 'software',
            },
          },
        },
        chains: {
          stx: {
            default: {
              currentAccountStacksDescriptor: `[${softwareWalletFingerprint}/44'/5757'/0'/0/0]02xyz789`,
            },
          },
        },
      } as unknown as RootState;

      const result = migrateMultiWalletSupport(inputState);

      expect(result.active?.account?.accountIndex).toEqual(0);
    });
  });

  describe('ledger wallet with bitcoin and stacks keys', () => {
    test('migrates ledger wallet with both bitcoin and stacks keys', () => {
      const inputState = {
        ledger: {
          bitcoin: {
            ids: ['default/native-segwit/0'],
            entities: {
              'default/native-segwit/0': {
                id: 'default/native-segwit/0',
                policy: `[${ledgerBitcoinFingerprint}/84'/0'/0']xpub123`,
                targetId: 'old-target',
                walletId: 'old-wallet',
              },
            },
          },
          stacks: {
            ids: ['default/0'],
            entities: {
              'default/0': {
                id: 'default/0',
                targetId: 'old-target',
                walletId: 'old-wallet',
              },
            },
          },
        },
        chains: {
          stx: {
            default: {
              currentAccountIndex: 1,
            },
          },
        },
      } as unknown as RootState;

      const result = migrateMultiWalletSupport(inputState);

      expect(result.active).toEqual({
        account: {
          fingerprint: ledgerBitcoinFingerprint,
          accountIndex: 1,
        },
      });

      expect(result.wallets.entities[ledgerBitcoinFingerprint]).toEqual({
        fingerprint: ledgerBitcoinFingerprint,
        name: 'My Ledger',
        type: 'ledger',
        createdOn: null,
      });
      expect(result.wallets.ids).toEqual([ledgerBitcoinFingerprint]);

      expect(result.ledger.bitcoin.ids).toEqual([`${ledgerBitcoinFingerprint}/native-segwit/0`]);
      expect(result.ledger.bitcoin.entities[`${ledgerBitcoinFingerprint}/native-segwit/0`]).toEqual(
        {
          id: `${ledgerBitcoinFingerprint}/native-segwit/0`,
          policy: `[${ledgerBitcoinFingerprint}/84'/0'/0']xpub123`,
          fingerprint: ledgerBitcoinFingerprint,
        }
      );

      expect(result.ledger.stacks.ids).toEqual([`${ledgerBitcoinFingerprint}/0`]);
      expect(result.ledger.stacks.entities[`${ledgerBitcoinFingerprint}/0`]).toEqual({
        id: `${ledgerBitcoinFingerprint}/0`,
        fingerprint: ledgerBitcoinFingerprint,
      });
    });
  });

  describe('ledger wallet with bitcoin keys only', () => {
    test('migrates ledger wallet with only bitcoin keys', () => {
      const inputState = {
        ledger: {
          bitcoin: {
            ids: ['default/native-segwit/0', 'default/taproot/1'],
            entities: {
              'default/native-segwit/0': {
                id: 'default/native-segwit/0',
                policy: `[${ledgerBitcoinFingerprint}/84'/0'/0']xpub456`,
                targetId: 'target-1',
                walletId: 'wallet-1',
              },
              'default/taproot/1': {
                id: 'default/taproot/1',
                policy: `[${ledgerBitcoinFingerprint}/86'/0'/1']xpub789`,
                targetId: 'target-2',
                walletId: 'wallet-2',
              },
            },
          },
          stacks: {
            ids: [],
            entities: {},
          },
        },
      } as unknown as RootState;

      const result = migrateMultiWalletSupport(inputState);

      expect(result.active?.account?.fingerprint).toEqual(ledgerBitcoinFingerprint);

      expect(result.wallets.entities[ledgerBitcoinFingerprint]).toEqual({
        fingerprint: ledgerBitcoinFingerprint,
        name: 'My Ledger',
        type: 'ledger',
        createdOn: null,
      });

      expect(result.ledger.bitcoin.ids).toEqual([
        `${ledgerBitcoinFingerprint}/native-segwit/0`,
        `${ledgerBitcoinFingerprint}/taproot/1`,
      ]);

      expect(result.ledger.bitcoin.entities[`${ledgerBitcoinFingerprint}/native-segwit/0`]).toEqual(
        {
          id: `${ledgerBitcoinFingerprint}/native-segwit/0`,
          policy: `[${ledgerBitcoinFingerprint}/84'/0'/0']xpub456`,
          fingerprint: ledgerBitcoinFingerprint,
        }
      );

      expect(result.ledger.bitcoin.entities[`${ledgerBitcoinFingerprint}/taproot/1`]).toEqual({
        id: `${ledgerBitcoinFingerprint}/taproot/1`,
        policy: `[${ledgerBitcoinFingerprint}/86'/0'/1']xpub789`,
        fingerprint: ledgerBitcoinFingerprint,
      });
    });
  });

  describe('ledger wallet with stacks keys only', () => {
    test('migrates ledger wallet with only stacks keys using assumed zero fingerprint', () => {
      const inputState = {
        ledger: {
          bitcoin: {
            ids: [],
            entities: {},
          },
          stacks: {
            ids: ['default/0', 'default/1'],
            entities: {
              'default/0': {
                id: 'default/0',
                publicKey: '02abc123',
                targetId: 'target-1',
                walletId: 'wallet-1',
              },
              'default/1': {
                id: 'default/1',
                publicKey: '02def456',
                targetId: 'target-2',
                walletId: 'wallet-2',
              },
            },
          },
        },
        chains: {
          stx: {
            default: {
              currentAccountIndex: 0,
            },
          },
        },
      } as unknown as RootState;

      const result = migrateMultiWalletSupport(inputState);

      expect(result.active?.account?.fingerprint).toEqual(assumedZeroFingerprint);

      expect(result.wallets.entities[assumedZeroFingerprint]).toEqual({
        fingerprint: assumedZeroFingerprint,
        name: 'My Ledger',
        type: 'ledger',
        createdOn: null,
      });

      expect(result.ledger.stacks.ids).toEqual([
        `${assumedZeroFingerprint}/0`,
        `${assumedZeroFingerprint}/1`,
      ]);

      expect(result.ledger.stacks.entities[`${assumedZeroFingerprint}/0`]).toEqual({
        id: `${assumedZeroFingerprint}/0`,
        publicKey: '02abc123',
        fingerprint: assumedZeroFingerprint,
      });

      expect(result.ledger.stacks.entities[`${assumedZeroFingerprint}/1`]).toEqual({
        id: `${assumedZeroFingerprint}/1`,
        publicKey: '02def456',
        fingerprint: assumedZeroFingerprint,
      });

      expect(result.chains.stx.default).toBeDefined();
    });
  });

  describe('default state with no keys', () => {
    test('migrates empty state with no keys', () => {
      const inputState = {} as unknown as RootState;

      const result = migrateMultiWalletSupport(inputState);

      expect(result.active).toEqual({
        account: {
          fingerprint: assumedZeroFingerprint,
          accountIndex: 0,
        },
      });

      expect(result.wallets).toEqual({
        ids: [],
        entities: {},
      });
    });

    test('migrates state with empty ledger and no software keys', () => {
      const inputState = {
        ledger: {
          bitcoin: {
            ids: [],
            entities: {},
          },
          stacks: {
            ids: [],
            entities: {},
          },
        },
      } as unknown as RootState;

      const result = migrateMultiWalletSupport(inputState);

      expect(result.active).toEqual({
        account: {
          fingerprint: assumedZeroFingerprint,
          accountIndex: 0,
        },
      });

      expect(result.wallets).toEqual({
        ids: [],
        entities: {},
      });
    });

    test('removes chains.stx.default when no keys exist', () => {
      const inputState = {
        chains: {
          stx: {
            default: {
              currentAccountIndex: 0,
              currentAccountStacksDescriptor: '',
              highestAccountIndex: 0,
            },
          },
        },
        ledger: {
          bitcoin: {
            entities: {},
            ids: [],
          },
          stacks: {
            entities: {},
            ids: [],
          },
        },
        softwareKeys: {
          ids: [],
          entities: {},
        },
      } as unknown as RootState;

      const result = migrateMultiWalletSupport(inputState);

      expect(result.active).toEqual({
        account: {
          fingerprint: assumedZeroFingerprint,
          accountIndex: 0,
        },
      });

      expect(result.wallets).toEqual({
        ids: [],
        entities: {},
      });

      expect(result.chains.stx).toEqual({});
    });
  });

  describe('app permissions migration', () => {
    test('that it adds a fingerprint to app permissions', () => {
      const inputState = {
        softwareKeys: {
          ids: ['default'],
          entities: {
            default: {
              id: 'default',
              salt: 'test-salt',
              type: 'software',
            },
          },
        },
        chains: {
          stx: {
            default: {
              currentAccountStacksDescriptor: `[${softwareWalletFingerprint}/44'/5757'/0'/0/0]02abc123`,
            },
          },
        },
        appPermissions: {
          ids: ['https://example.com', 'https://test.com'],
          entities: {
            'https://example.com': {
              origin: 'https://example.com',
              status: 'connected',
            },
            'https://test.com': {
              origin: 'https://test.com',
              status: 'connected',
            },
          },
        },
      } as unknown as RootState;

      const result = migrateMultiWalletSupport(inputState);

      expect(result.appPermissions.entities['https://example.com'].fingerprint).toEqual(
        softwareWalletFingerprint
      );
      expect(result.appPermissions.entities['https://test.com'].fingerprint).toEqual(
        softwareWalletFingerprint
      );
    });
  });

  describe('legacy property cleanup', () => {
    test('removes targetId and walletId from bitcoin entities', () => {
      const inputState = {
        ledger: {
          bitcoin: {
            ids: [`${ledgerBitcoinFingerprint}/native-segwit/0`],
            entities: {
              [`${ledgerBitcoinFingerprint}/native-segwit/0`]: {
                id: `${ledgerBitcoinFingerprint}/native-segwit/0`,
                policy: `[${ledgerBitcoinFingerprint}/84'/0'/0']xpub123`,
                targetId: 'should-be-removed',
                walletId: 'should-be-removed',
                fingerprint: ledgerBitcoinFingerprint,
              },
            },
          },
          stacks: {
            ids: [],
            entities: {},
          },
        },
      } as unknown as RootState;

      const result = migrateMultiWalletSupport(inputState);

      expect(result.ledger.bitcoin.entities[`${ledgerBitcoinFingerprint}/native-segwit/0`]).toEqual(
        {
          id: `${ledgerBitcoinFingerprint}/native-segwit/0`,
          policy: `[${ledgerBitcoinFingerprint}/84'/0'/0']xpub123`,
          fingerprint: ledgerBitcoinFingerprint,
        }
      );
    });

    test('removes targetId and walletId from stacks entities', () => {
      const inputState = {
        ledger: {
          bitcoin: {
            ids: [],
            entities: {},
          },
          stacks: {
            ids: [`${assumedZeroFingerprint}/0`],
            entities: {
              [`${assumedZeroFingerprint}/0`]: {
                id: `${assumedZeroFingerprint}/0`,
                publicKey: '02abc123',
                targetId: 'should-be-removed',
                walletId: 'should-be-removed',
                fingerprint: assumedZeroFingerprint,
              },
            },
          },
        },
      } as unknown as RootState;

      const result = migrateMultiWalletSupport(inputState);

      expect(result.ledger.stacks.entities[`${assumedZeroFingerprint}/0`]).toEqual({
        id: `${assumedZeroFingerprint}/0`,
        publicKey: '02abc123',
        fingerprint: assumedZeroFingerprint,
      });
    });
  });
});
