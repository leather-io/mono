import { useSelector } from 'react-redux';

import { AvatarIcon } from '@/components/avatar-icon';
import { t } from '@lingui/macro';
import { createAction, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { produce } from 'immer';

import type { RootState } from '..';
import { handleAppResetWithState, userAddsWallet, userRemovesWallet } from '../global-action';
import { BitcoinKeychainStore } from '../keychains/bitcoin/bitcoin-keychains.write';
import { StacksKeychainStore } from '../keychains/stacks/stacks-keychains.write';
import { Optional, handleEntityActionWith, makeAccountIdentifer } from '../utils';
import { initalizeAccount } from './accounts';

type AccountStatus = 'active' | 'hidden';

export interface AccountStore {
  id: string;
  icon: string | AvatarIcon;
  name: string;
  status: AccountStatus;
}

const adapter = createEntityAdapter<AccountStore, string>({
  selectId: account => account.id,
});

function addAccountDefaults({
  account,
  accountIdx,
}: {
  account: PartialAccountStore;
  accountIdx: number;
}): AccountStore {
  const updatedAccount = produce(account, draftAccount => {
    if (!draftAccount.icon) {
      draftAccount.icon = 'sparkles';
    }
    if (!draftAccount.name) {
      draftAccount.name = t`Account ${accountIdx}`;
    }
    if (!draftAccount.status) {
      draftAccount.status = 'active';
    }
    return draftAccount;
  });
  return updatedAccount as AccountStore;
}

const initialState = adapter.getInitialState();

export const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder
      // Provision the first account with new wallet creation
      .addCase(userAddsWallet, (state, action) => {
        const firstAccountIndex = 0;
        const id = makeAccountIdentifer(action.payload.wallet.fingerprint, firstAccountIndex);

        adapter.addOne(
          state,
          addAccountDefaults({ account: { id }, accountIdx: state.ids.length })
        );
      })

      .addCase(userRemovesWallet, (state, action) => {
        const fingerprint = action.payload.fingerprint;
        const accountIds = state.ids.filter(id => id.startsWith(fingerprint));
        adapter.removeMany(state, accountIds);
      })

      .addCase(userAddsAccount, (state, action) => {
        return adapter.addOne(
          state,
          addAccountDefaults({ account: action.payload.account, accountIdx: state.ids.length })
        );
      })

      .addCase(
        userTogglesHideAccount,
        handleEntityActionWith(adapter.updateOne, (payload, state) => {
          let newStatus: AccountStatus = 'active' as const;
          if (state.entities[payload.accountId]?.status === 'active') {
            newStatus = 'hidden' as const;
          }
          return {
            id: payload.accountId,
            changes: { status: newStatus } as const,
          };
        })
      )

      .addCase(
        userRenamesAccount,
        handleEntityActionWith(adapter.updateOne, payload => ({
          id: payload.accountId,
          changes: { name: payload.name },
        }))
      )

      .addCase(
        userAddsIconToAccountPayload,
        handleEntityActionWith(adapter.updateOne, payload => ({
          id: makeAccountIdentifer(payload.fingerprint, payload.accountIndex),
          changes: { icon: payload.icon },
        }))
      )

      .addCase(userUpdatesAccountOrder, (state, action) => {
        state.ids = action.payload.accountIds;
      })

      .addCase(...handleAppResetWithState(initialState)),
});

const selectors = adapter.getSelectors((state: RootState) => state.accounts);

export function selectAccounts(status?: AccountStatus) {
  return createSelector(selectors.selectAll, accounts => {
    switch (status) {
      case 'active':
        return accounts.filter(account => account.status === 'active').map(initalizeAccount);
      case 'hidden':
        return accounts.filter(account => account.status === 'hidden').map(initalizeAccount);
      default:
        return accounts.map(initalizeAccount);
    }
  });
}

export const selectAccountsByFingerprint = (fingerprint: string, status?: AccountStatus) =>
  createSelector(selectAccounts(status), accounts =>
    accounts.filter(account => account.fingerprint === fingerprint)
  );

export function selectAccountByIndex(fingerprint: string, idx: number) {
  return createSelector(
    selectAccountsByFingerprint(fingerprint),
    accounts => accounts.filter(account => account.accountIndex === idx)[0]
  );
}

export function useAccountsByFingerprint(fingerprint: string, status?: AccountStatus) {
  return {
    list: useSelector(selectAccountsByFingerprint(fingerprint, status)),
  };
}

export function useAccounts(status?: AccountStatus) {
  return {
    list: useSelector(selectAccounts(status)),
  };
}

export function useAccountByIndex(fingerprint: string, index: number) {
  return useSelector(selectAccountByIndex(fingerprint, index));
}

type PartialAccountStore = Optional<AccountStore, 'icon' | 'name' | 'status'>;

interface AddAccountPayload {
  account: PartialAccountStore;
  withKeychains: {
    bitcoin: BitcoinKeychainStore[];
    stacks: StacksKeychainStore[];
  };
}
export const userAddsAccount = createAction<AddAccountPayload>('accounts/userAddsAccount');

interface ToggleHideAccountPayload {
  accountId: string;
}
export const userTogglesHideAccount = createAction<ToggleHideAccountPayload>(
  'accounts/toggleHideAccount'
);

interface RenameAccountPayload {
  name: string;
  accountId: string;
}
export const userRenamesAccount = createAction<RenameAccountPayload>('accounts/renameAccount');

interface AddIconToAccountPayload {
  fingerprint: string;
  accountIndex: number;
  icon: string;
}
export const userAddsIconToAccountPayload = createAction<AddIconToAccountPayload>(
  'accounts/addIconToAccount'
);

interface UpdateAccountOrderPayload {
  accountIds: string[];
}
export const userUpdatesAccountOrder = createAction<UpdateAccountOrderPayload>(
  'accounts/updateAccountOrder'
);