import { describe, expect, test } from 'vitest';

import { makeAccountIdentifer } from '@leather.io/crypto';
import { fingerprintMigration, userAddsWallet, userRemovesWallet } from '@leather.io/state/wallet';

import { assumedZeroFingerprint } from '@shared/utils';

import { makePolicyId } from '../policy/policy-store.utils';
import { userAddsPolicy, userRemovesPolicy } from '../policy/policy.slice';
import { accountsAdapter, accountsSlice, userClearsAccountName } from './accounts.slice';

const realFingerprint = 'abcd1234';
const multisigAddress = 'bc1qexampleexampleexampleexampleexampleexamplexyz';

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

  describe('userAddsPolicy', () => {
    test('creates an account row carrying the policy name and active status', () => {
      const parentAccountId = makeAccountIdentifer(realFingerprint, 0);
      const networkId = 'mainnet';
      const id = makePolicyId(parentAccountId, multisigAddress, networkId);

      const result = accountsSlice.reducer(
        accountsAdapter.getInitialState(),
        userAddsPolicy({
          policy: {
            id,
            parentAccountId,
            networkId,
            chain: 'bitcoin',
            address: multisigAddress,
            descriptor: 'wsh(sortedmulti(2,xpubA/0/0,xpubB/0/0))',
            role: 'signer',
          },
          name: 'Family vault',
        })
      );

      expect(result.entities[id]).toEqual({ id, name: 'Family vault', status: 'active' });
    });

    test('re-adds idempotently, updating the name in place', () => {
      const parentAccountId = makeAccountIdentifer(realFingerprint, 0);
      const networkId = 'mainnet';
      const id = makePolicyId(parentAccountId, multisigAddress, networkId);
      const policy = {
        id,
        parentAccountId,
        networkId,
        chain: 'bitcoin' as const,
        address: multisigAddress,
        descriptor: 'wsh(sortedmulti(2,xpubA/0/0,xpubB/0/0))',
        role: 'signer' as const,
      };

      let state = accountsSlice.reducer(
        accountsAdapter.getInitialState(),
        userAddsPolicy({ policy, name: 'Family vault' })
      );
      state = accountsSlice.reducer(state, userAddsPolicy({ policy, name: 'Renamed vault' }));

      expect(state.ids).toEqual([id]);
      expect(state.entities[id]).toEqual({ id, name: 'Renamed vault', status: 'active' });
    });
  });

  describe('userRemovesPolicy', () => {
    test('removes the policy name/metadata row', () => {
      const parentAccountId = makeAccountIdentifer(realFingerprint, 0);
      const networkId = 'mainnet';
      const id = makePolicyId(parentAccountId, multisigAddress, networkId);

      let state = accountsSlice.reducer(
        accountsAdapter.getInitialState(),
        userAddsPolicy({
          policy: {
            id,
            parentAccountId,
            networkId,
            chain: 'bitcoin',
            address: multisigAddress,
            descriptor: 'wsh(sortedmulti(2,xpubA/0/0,xpubB/0/0))',
            role: 'signer',
          },
          name: 'Family vault',
        })
      );
      state = accountsSlice.reducer(state, userRemovesPolicy({ policyId: id }));

      expect(state.entities[id]).toBeUndefined();
    });

    test('leaves sibling account rows intact', () => {
      const accountId = makeAccountIdentifer(realFingerprint, 0);
      const seeded = accountsAdapter.addOne(accountsAdapter.getInitialState(), {
        id: accountId,
        name: 'Custom',
      });

      const result = accountsSlice.reducer(
        seeded,
        userRemovesPolicy({ policyId: 'someparent/0/addr/mainnet' })
      );

      expect(result.entities[accountId]).toEqual({ id: accountId, name: 'Custom' });
    });
  });

  describe('userClearsAccountName', () => {
    test('removes a name-only entity so display reverts to the bns/default name', () => {
      const accountId = makeAccountIdentifer(realFingerprint, 0);
      const seeded = accountsAdapter.addOne(accountsAdapter.getInitialState(), {
        id: accountId,
        name: 'Custom',
      });

      const result = accountsSlice.reducer(seeded, userClearsAccountName({ accountId }));

      expect(result.entities[accountId]).toBeUndefined();
    });

    test('drops the custom name but preserves a hidden status', () => {
      const accountId = makeAccountIdentifer(realFingerprint, 0);
      const seeded = accountsAdapter.addOne(accountsAdapter.getInitialState(), {
        id: accountId,
        name: 'Custom',
        status: 'hidden',
      });

      const result = accountsSlice.reducer(seeded, userClearsAccountName({ accountId }));

      expect(result.entities[accountId]).toEqual({ id: accountId, status: 'hidden' });
    });

    test('is a no-op for an account with no entity', () => {
      const seeded = accountsAdapter.addOne(accountsAdapter.getInitialState(), {
        id: makeAccountIdentifer(realFingerprint, 0),
        name: 'Existing',
      });

      const result = accountsSlice.reducer(
        seeded,
        userClearsAccountName({ accountId: makeAccountIdentifer(realFingerprint, 9) })
      );

      expect(result).toEqual(seeded);
    });
  });
});
