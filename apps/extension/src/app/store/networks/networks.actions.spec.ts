import { describe, expect, test, vi } from 'vitest';

import { selectPolicyNetworkIds } from '../policy/policy.selectors';
import { networksActions, userEditsNetwork, userRemovesNetwork } from './networks.actions';
import type { PersistedNetworkConfiguration } from './networks.slice';

vi.mock('../policy/policy.selectors', () => ({
  selectPolicyNetworkIds: vi.fn(),
}));

const editedNetwork = {
  id: 'edited-custom-network',
  name: 'Edited custom network',
  chainId: 1,
  url: 'https://stacks.example.com',
  bitcoinNetwork: 'mainnet',
  mode: 'mainnet',
  bitcoinUrl: 'https://bitcoin.example.com',
} satisfies PersistedNetworkConfiguration;

function runRemoveThunk(id: string) {
  const dispatch = vi.fn();
  const getState = vi.fn();
  getState.mockReturnValue({});
  void userRemovesNetwork(id)(dispatch, getState, undefined);
  return dispatch;
}

function runEditThunk(currentId: string) {
  const dispatch = vi.fn();
  const getState = vi.fn();
  getState.mockReturnValue({});
  void userEditsNetwork({ currentId, network: editedNetwork })(dispatch, getState, undefined);
  return dispatch;
}

describe(userRemovesNetwork.name, () => {
  test('removes a network that has no policy', () => {
    vi.mocked(selectPolicyNetworkIds).mockReturnValue(new Set());
    const dispatch = runRemoveThunk('custom-network');
    expect(dispatch).toHaveBeenCalledWith(networksActions.removeNetwork('custom-network'));
  });

  test('does not remove a network that has a policy', () => {
    vi.mocked(selectPolicyNetworkIds).mockReturnValue(new Set(['custom-network']));
    const dispatch = runRemoveThunk('custom-network');
    expect(dispatch).not.toHaveBeenCalled();
  });
});

describe(userEditsNetwork.name, () => {
  test('edits a network that has no policy', () => {
    vi.mocked(selectPolicyNetworkIds).mockReturnValue(new Set());
    const dispatch = runEditThunk('custom-network');
    expect(dispatch).toHaveBeenNthCalledWith(1, networksActions.removeNetwork('custom-network'));
    expect(dispatch).toHaveBeenNthCalledWith(2, networksActions.addNetwork(editedNetwork));
    expect(dispatch).toHaveBeenNthCalledWith(
      3,
      networksActions.changeNetwork('edited-custom-network')
    );
  });

  test('does not edit a network that has a policy', () => {
    vi.mocked(selectPolicyNetworkIds).mockReturnValue(new Set(['custom-network']));
    const dispatch = runEditThunk('custom-network');
    expect(dispatch).not.toHaveBeenCalled();
  });
});
