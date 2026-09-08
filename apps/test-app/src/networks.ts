// The wallet network every request in a run is pinned to.
//
// The extension matches the `network` param against the ids in its own network
// list; an UNKNOWN id is silently ignored and the request falls back to the
// user's selected network — so a typo here looks like a passing test on the
// wrong chain. Keep the ids in this list in sync with the wallet's.
//
// Pure: no React, no `window`, so builders and Playwright share it.
import { readOverride } from './env';
import type { NetworkMode } from './types';

export interface WalletNetwork {
  /** Id sent as the `network` param. */
  id: string;
  label: string;
  /** Address flavour this chain uses, for encoding and validation. */
  mode: NetworkMode;
  note?: string;
}

// `private` is the wallet's custom-network slot, so what it means depends on
// what the developer registered under it: a local regtest node (bcrt1…) or
// Hiro's hosted pox-5 testnet (tb1…). Everything network-flavoured reads this.
const privateNetworkMode: NetworkMode =
  readOverride('PRIVATE_NETWORK_MODE') === 'testnet' ? 'testnet' : 'regtest';

const customNetworkId = readOverride('CUSTOM_NETWORK_ID');
const networkModes: Record<string, NetworkMode> = {
  mainnet: 'mainnet',
  testnet: 'testnet',
  regtest: 'regtest',
};
const customNetworkMode: NetworkMode =
  networkModes[readOverride('CUSTOM_NETWORK_MODE') ?? ''] ?? 'regtest';

const builtInNetworks: WalletNetwork[] = [
  { id: 'mainnet', label: 'Mainnet', mode: 'mainnet' },
  { id: 'testnet4', label: 'Testnet4', mode: 'testnet' },
  { id: 'signet', label: 'Signet', mode: 'testnet' },
  { id: 'devnet', label: 'Devnet', mode: 'regtest', note: 'Local devnet (bitcoind + stacks-node)' },
  {
    id: 'private',
    label: 'Private',
    mode: privateNetworkMode,
    note: 'Custom network registered in the wallet under the id "private"',
  },
];

export const walletNetworks: WalletNetwork[] = customNetworkId
  ? [
      ...builtInNetworks,
      { id: customNetworkId, label: `Custom (${customNetworkId})`, mode: customNetworkMode },
    ]
  : builtInNetworks;

export const defaultNetworkId =
  walletNetworks.find(network => network.id === readOverride('DEFAULT_NETWORK'))?.id ?? 'mainnet';

/** Address flavour for a network id; unknown ids are treated as mainnet. */
export function networkModeOf(networkId: string): NetworkMode {
  return walletNetworks.find(network => network.id === networkId)?.mode ?? 'mainnet';
}

export function isMainnet(networkId: string): boolean {
  return networkModeOf(networkId) === 'mainnet';
}
