import { describe, expect, test } from 'vitest';

import { makeAccountIdentifer } from '@leather.io/crypto';
import { fingerprintMigration, userAddsWallet, userRemovesWallet } from '@leather.io/state/wallet';

import { assumedZeroFingerprint } from '@shared/utils';

import { accountsAdapter, accountsSlice } from './accounts.slice';

const realFingerprint = 'abcd1234';

describe('accountsSlice', () => {
  describe('fingerprintMigration', () => {
    test('re-keys assumed-zero accounts to the real fingerprint, preserving metadata', () => {
      const seeded = accountsAdapter.addMany(accountsAdapter.getInitialState(), [
        { id: makeAccountIdentifer(assumedZeroFingerprint, 0), name: 'My main', status: 'hidden' },
        { id: makeAccountIdentifer(assumedZeroFingerprint, 1), name: 'Savings' },
      ]);

      const result = accountsSlice.reducer(seeded, fingerprintMigration(realFingerprint));

      expect(result.ids).toEqual([
        makeAccountIdentifer(realFingerprint, 0),
        makeAccountIdentifer(realFingerprint, 1),
      ]);
      expect(result.entities[makeAccountIdentifer(realFingerprint, 0)]).toEqual({
        id: makeAccountIdentifer(realFingerprint, 0),
        name: 'My main',
        status: 'hidden',
      });
      expect(result.entities[makeAccountIdentifer(realFingerprint, 1)]).toEqual({
        id: makeAccountIdentifer(realFingerprint, 1),
        name: 'Savings',
      });
      expect(result.ids.some(id => String(id).startsWith(`${assumedZeroFingerprint}/`))).toBe(
        false
      );
    });

    test('keeps re-keyed accounts when the migration remove/add cascade follows', () => {
      let state = accountsAdapter.addMany(accountsAdapter.getInitialState(), [
        { id: makeAccountIdentifer(assumedZeroFingerprint, 0), name: 'My main', status: 'hidden' },
        { id: makeAccountIdentifer(assumedZeroFingerprint, 1), name: 'Savings' },
      ]);

      state = accountsSlice.reducer(state, fingerprintMigration(realFingerprint));
      state = accountsSlice.reducer(
        state,
        userRemovesWallet({ fingerprint: assumedZeroFingerprint })
      );
      state = accountsSlice.reducer(
        state,
        userAddsWallet({
          wallet: { fingerprint: realFingerprint, createdOn: null, type: 'ledger' },
          accountKeychains: [],
        })
      );

      expect(state.entities[makeAccountIdentifer(realFingerprint, 0)]).toEqual({
        id: makeAccountIdentifer(realFingerprint, 0),
        name: 'My main',
        status: 'hidden',
      });
      expect(state.entities[makeAccountIdentifer(realFingerprint, 1)]).toEqual({
        id: makeAccountIdentifer(realFingerprint, 1),
        name: 'Savings',
      });
    });

    test('is a no-op when there are no assumed-zero accounts', () => {
      const seeded = accountsAdapter.addMany(accountsAdapter.getInitialState(), [
        { id: makeAccountIdentifer(realFingerprint, 0), name: 'Existing' },
      ]);

      const result = accountsSlice.reducer(seeded, fingerprintMigration('99999999'));

      expect(result).toEqual(seeded);
    });
  });
});
