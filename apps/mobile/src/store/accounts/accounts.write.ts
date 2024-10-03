import { AvatarIcon } from '@/components/avatar-icon';
import { AccountId } from '@/models/domain.model';
import { t } from '@lingui/macro';
import { createAction, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { produce } from 'immer';

import { handleAppResetWithState, userAddsWallet, userRemovesWallet } from '../global-action';
import { BitcoinKeychainStore } from '../keychains/bitcoin/bitcoin-keychains.write';
import { StacksKeychainStore } from '../keychains/stacks/stacks-keychains.write';
import { Optional, handleEntityActionWith, makeAccountIdentifer } from '../utils';

export type AccountStatus = 'active' | 'hidden';

export interface AccountStore {
  id: string;
  icon: string | AvatarIcon;
  name: string;
  status: AccountStatus;
}

export const accountsAdapter = createEntityAdapter<AccountStore, string>({
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
      draftAccount.name = t({
        id: 'account.default.name',
        message: `Account ${accountIdx}`,
      });
    }
    if (!draftAccount.status) {
      draftAccount.status = 'active';
    }
    return draftAccount;
  });
  return updatedAccount as AccountStore;
}

const initialState = accountsAdapter.getInitialState();

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

        accountsAdapter.addOne(
          state,
          addAccountDefaults({ account: { id }, accountIdx: state.ids.length })
        );
      })

      .addCase(userRemovesWallet, (state, action) => {
        const fingerprint = action.payload.fingerprint;
        const accountIds = state.ids.filter(id => id.startsWith(fingerprint));
        accountsAdapter.removeMany(state, accountIds);
      })

      .addCase(userAddsAccount, (state, action) => {
        return accountsAdapter.addOne(
          state,
          addAccountDefaults({ account: action.payload.account, accountIdx: state.ids.length })
        );
      })

      .addCase(
        userTogglesHideAccount,
        handleEntityActionWith(accountsAdapter.updateOne, (payload, state) => {
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
        handleEntityActionWith(accountsAdapter.updateOne, payload => ({
          id: payload.accountId,
          changes: { name: payload.name },
        }))
      )

      .addCase(
        userUpdatesAccountIcon,
        handleEntityActionWith(accountsAdapter.updateOne, payload => ({
          id: makeAccountIdentifer(payload.fingerprint, payload.accountIndex),
          changes: { icon: payload.icon },
        }))
      )

      .addCase(userUpdatesAccountOrder, (state, action) => {
        state.ids = action.payload.accountIds;
      })

      .addCase(...handleAppResetWithState(initialState)),
});

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

interface UpdateAccountIconPayload extends AccountId {
  icon: string;
}
export const userUpdatesAccountIcon = createAction<UpdateAccountIconPayload>(
  'accounts/addIconToAccount'
);

interface UpdateAccountOrderPayload {
  accountIds: string[];
}
export const userUpdatesAccountOrder = createAction<UpdateAccountOrderPayload>(
  'accounts/updateAccountOrder'
);
