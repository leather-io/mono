import { broadcastReplayAction } from '@shared/messages';

import { AppThunk } from '..';
import { userRemovesPolicy } from './policy.slice';

export function removePolicy(policyId: string): AppThunk {
  return dispatch => {
    const action = userRemovesPolicy({ policyId });
    dispatch(action);
    void broadcastReplayAction(action);
  };
}
