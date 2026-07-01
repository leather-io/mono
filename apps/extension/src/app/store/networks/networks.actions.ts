import { logger } from '@shared/logger';

import { AppThunk } from '..';
import { selectPolicyNetworkIds } from '../policy/policy.selectors';
import { type PersistedNetworkConfiguration, networksSlice } from './networks.slice';

export const networksActions = networksSlice.actions;

interface UserEditsNetworkArgs {
  currentId: string;
  network: PersistedNetworkConfiguration;
}

export function userRemovesNetwork(id: string): AppThunk {
  return (dispatch, getState) => {
    if (selectPolicyNetworkIds(getState()).has(id)) {
      logger.warn('Cannot remove a network that has a policy', { id });
      return;
    }
    dispatch(networksActions.removeNetwork(id));
  };
}

export function userEditsNetwork({ currentId, network }: UserEditsNetworkArgs): AppThunk {
  return (dispatch, getState) => {
    if (selectPolicyNetworkIds(getState()).has(currentId)) {
      logger.warn('Cannot edit a network that has a policy', { id: currentId });
      return;
    }
    dispatch(networksActions.removeNetwork(currentId));
    dispatch(networksActions.addNetwork(network));
    dispatch(networksActions.changeNetwork(network.id));
  };
}
