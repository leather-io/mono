import { t } from '@lingui/macro';
import { EntityState, createAction, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { produce } from 'immer';

import { AccountId } from '@leather.io/models';

import { handleAppResetWithState, userAddsWallet, userRemovesWallet } from '../global-action';
import { BitcoinKeychain } from '../keychains/bitcoin/utils';
import { StacksKeychain } from '../keychains/stacks/utils';
import {
  Optional,
  entitySchema,
  getWalletAccountsByAccountId,
  handleEntityActionWith,
  makeAccountIdentifer,
  selectNextDistinctAccountIcon,
} from '../utils';
import { AccountStatus, AccountStore, accountStoreSchema } from './utils';

export const accountsAdapter = createEntityAdapter<AccountStore, string>({
  selectId: account => account.id,
});
export const accountEntitySchema = entitySchema(accountStoreSchema);

function addAccountDefaults({
  state,
  account,
  accountIndex,
}: {
  state: EntityState<AccountStore, string>;
  account: PartialAccountStore;
  accountIndex: number;
}): AccountStore {
  const currentWalletAccounts = getWalletAccountsByAccountId(state, account.id);
  const usedIcons = Object.values(state.entities).map(account => account.icon);
  const precedingIcon = currentWalletAccounts[currentWalletAccounts.length - 1]?.icon;

  const updatedAccount = produce(account, draftAccount => {
    if (!draftAccount.icon) {
      draftAccount.icon = selectNextDistinctAccountIcon(usedIcons, precedingIcon);
    }
    if (!draftAccount.name) {
      draftAccount.name = t({
        id: 'account.default.name',
        message: `Account ${accountIndex}`,
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
          addAccountDefaults({
            state,
            account: { id },
            accountIndex: 1,
          })
        );
      })

      .addCase(userRemovesWallet, (state, action) => {
        const fingerprint = action.payload.fingerprint;
        const accountIds = state.ids.filter(id => id.startsWith(fingerprint));
        accountsAdapter.removeMany(state, accountIds);
      })

      .addCase(userAddsAccount, (state, action) => {
        const thisWalletsAccounts = getWalletAccountsByAccountId(state, action.payload.account.id);

        return accountsAdapter.addOne(
          state,
          addAccountDefaults({
            state,
            account: action.payload.account,
            accountIndex: thisWalletsAccounts.length + 1,
          })
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
    bitcoin: BitcoinKeychain[];
    stacks: StacksKeychain[];
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
