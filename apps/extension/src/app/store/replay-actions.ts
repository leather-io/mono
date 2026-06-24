import type { UnknownAction } from '@reduxjs/toolkit';

import { userAddsAccount } from '@leather.io/state/keychains';
import { userRenamesWallet } from '@leather.io/state/wallet';

import {
  userClearsAccountName,
  userRenamesAccount,
  userTogglesHideAccount,
} from './accounts/accounts.slice';
import { userSwitchesAccount } from './active/active.slice';
import { stxChainSlice } from './chains/stx-chain.slice';

const replayableActionTypes = new Set<string>([
  userRenamesWallet.type,
  userRenamesAccount.type,
  userClearsAccountName.type,
  userTogglesHideAccount.type,
  userAddsAccount.type,
  userSwitchesAccount.type,
  stxChainSlice.actions.createNewAccount.type,
  stxChainSlice.actions.restoreAccountIndex.type,
]);

export function isReplayableAction(action: UnknownAction) {
  return replayableActionTypes.has(action.type);
}
