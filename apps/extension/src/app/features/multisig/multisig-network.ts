import { type AuthNetworkId, ChainId, type NetworkConfiguration } from '@leather.io/models';

// Derives the AuthNetworkId (the coordinator's chain identifier) for a policy of
// the given chain on the active network. A policy is always on the active network
// (active.slice clears activePolicyId on network switch), so the active network's
// mode/chainId is authoritative.
export function getPolicyAuthNetworkId(
  chain: 'bitcoin' | 'stacks',
  network: NetworkConfiguration
): AuthNetworkId {
  if (chain === 'bitcoin')
    return network.chain.bitcoin.mode === 'mainnet' ? 'btc:mainnet' : 'btc:testnet';
  return network.chain.stacks.chainId === ChainId.Mainnet ? 'stx:mainnet' : 'stx:testnet';
}
