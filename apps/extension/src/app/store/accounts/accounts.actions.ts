import { broadcastReplayAction } from '@shared/messages';

import { AppThunk } from '..';
import { userRenamesAccount, userTogglesHideAccount } from './accounts.slice';

export function renameAccount(accountId: string, name: string): AppThunk {
  return dispatch => {
    const action = userRenamesAccount({ accountId, name });
    dispatch(action);
    void broadcastReplayAction(action);
  };
}

export function toggleHideAccount(accountId: string): AppThunk {
  return dispatch => {
    const action = userTogglesHideAccount({ accountId });
    dispatch(action);
    void broadcastReplayAction(action);
  };
}
