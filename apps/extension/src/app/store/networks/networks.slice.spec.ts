import { ChainId } from '@stacks/network';
import { describe, expect, test } from 'vitest';

import { type PersistedNetworkConfiguration, networksSlice } from './networks.slice';

const { addNetwork, changeNetwork, removeNetwork } = networksSlice.actions;

function makeNetwork(overrides: Partial<PersistedNetworkConfiguration> = {}) {
  const network: PersistedNetworkConfiguration = {
    id: 'devnet',
    name: 'Devnet',
    chainId: ChainId.Testnet,
    url: 'http://localhost:3999',
    bitcoinNetwork: 'regtest',
    mode: 'testnet',
    bitcoinUrl: 'http://localhost:8999/api',
  };
  return { ...network, ...overrides };
}

function initialState() {
  return networksSlice.reducer(undefined, { type: 'init' });
}

describe('networksSlice', () => {
  test('adds a network', () => {
    const state = networksSlice.reducer(initialState(), addNetwork(makeNetwork()));
    expect(state.entities.devnet).toEqual(makeNetwork());
  });

  test('re-adding an existing id overwrites instead of silently dropping the change', () => {
    const stateWithNetwork = networksSlice.reducer(initialState(), addNetwork(makeNetwork()));
    const updated = makeNetwork({ name: 'Devnet updated', url: 'http://localhost:20443' });

    const state = networksSlice.reducer(stateWithNetwork, addNetwork(updated));

    expect(state.entities.devnet).toEqual(updated);
  });

  test('removes a network', () => {
    const stateWithNetwork = networksSlice.reducer(initialState(), addNetwork(makeNetwork()));
    const state = networksSlice.reducer(stateWithNetwork, removeNetwork('devnet'));
    expect(state.entities.devnet).toBeUndefined();
  });

  test('changes the current network', () => {
    const state = networksSlice.reducer(initialState(), changeNetwork('devnet'));
    expect(state.currentNetworkId).toBe('devnet');
  });
});
