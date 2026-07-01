import { describe, expect, test } from 'vitest';

import { makeAccountIdentifer } from '@leather.io/crypto';
import { userAddsAccount } from '@leather.io/state/keychains';
import { userRenamesWallet } from '@leather.io/state/wallet';

import {
  userClearsAccountName,
  userRenamesAccount,
  userTogglesHideAccount,
} from './accounts/accounts.slice';
import { userSwitchesAccount, userSwitchesToPolicy } from './active/active.slice';
import { stxChainSlice } from './chains/stx-chain.slice';
import { userAddsPolicy, userRemovesPolicy } from './policy/policy.slice';
import { isReplayableAction } from './replay-actions';

const broadcastActionTypes = [
  userRenamesWallet.type,
  userRenamesAccount.type,
  userClearsAccountName.type,
  userTogglesHideAccount.type,
  userAddsAccount.type,
  userSwitchesAccount.type,
  userAddsPolicy.type,
  userRemovesPolicy.type,
  userSwitchesToPolicy.type,
  stxChainSlice.actions.createNewAccount.type,
  stxChainSlice.actions.restoreAccountIndex.type,
];

describe('isReplayableAction', () => {
  test('replays a cleared account name so other frames revert to the bns/default name', () => {
    const action = userClearsAccountName({ accountId: makeAccountIdentifer('abcd1234', 0) });
    expect(isReplayableAction(action)).toBe(true);
  });

  test.each(broadcastActionTypes)('replays "%s", which is broadcast for cross-frame sync', type => {
    expect(isReplayableAction({ type })).toBe(true);
  });

  test('ignores actions that are not broadcast for replay', () => {
    expect(isReplayableAction({ type: 'accounts/userSelectsAccount' })).toBe(false);
  });
});
