import { StacksNetworkName } from '@stacks/network';
import { NetworkMode } from '~/features/stacking/utils/stacking-network-types';

import { BitcoinNetworkModes, HIRO_API_BASE_URL_MAINNET } from '@leather.io/models';

// ---------------------------------------------------------------------------
// The one line to edit when moving Bitcoin Staking between test chains.
// ---------------------------------------------------------------------------
const activePox5Chain: Pox5ChainName = 'mainnet';

type Pox5ChainName = 'mainnet' | 'devnet' | 'private';

interface Pox5ChainConfig {
  // Wallet network key every pox-5 RPC call is pinned to, so transactions land
  // on this chain regardless of the app's network selector. The extension
  // matches it against the ids in its own network list: an unknown key is
  // silently ignored and the request falls back to the user's selected
  // network, so the wallet must have a network stored under exactly this id.
  walletRpcNetwork: string;
  // Network mode the pox-5 boot contract and the pool signer-manager contract
  // ids resolve from. The private testnet is testnet-flavoured (ST addresses),
  // so it reads from the testnet map rather than a map of its own.
  contractNetworkMode: NetworkMode;
  // Stacks API every pox-5 read is pinned to. Checking pox-5 state against the
  // app-selected network would validate against the wrong chain entirely.
  apiUrl: string;
  // Address flavour used when decoding a stored BTC payout preference back to
  // an address.
  stacksNetworkName: StacksNetworkName;
  // Burn chain flavour, used to validate the BTC reward addresses users enter.
  bitcoinNetworkMode: BitcoinNetworkModes;
  // Signer-manager contract backing the "Special" pool on this chain — the one
  // reference deployment we hold a contract id for.
  specialSignerManagerContracts?: string[];
}

// devnet is the local pox-5 devnet from leather-workspace/devnet: its API URL
// is the host proxy (routes /v2,/v3 to the stacks-node, the rest to the stacks
// API), which is what Leather's built-in devnet network also targets, so no
// wallet setup is needed. private is Hiro's hosted pox-5 testnet, which is not
// a Leather built-in — it has to be added in the wallet as a custom network
// with id `private` pointing at its apiUrl before anything can be signed.
const pox5Chains: Record<Pox5ChainName, Pox5ChainConfig> = {
  mainnet: {
    walletRpcNetwork: 'mainnet',
    contractNetworkMode: 'mainnet',
    apiUrl: HIRO_API_BASE_URL_MAINNET,
    stacksNetworkName: 'mainnet',
    bitcoinNetworkMode: 'mainnet',
  },
  devnet: {
    walletRpcNetwork: 'devnet',
    contractNetworkMode: 'devnet',
    apiUrl: 'http://localhost:3999',
    stacksNetworkName: 'devnet',
    bitcoinNetworkMode: 'regtest',
    specialSignerManagerContracts: ['ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.signer-manager'],
  },
  private: {
    walletRpcNetwork: 'private',
    contractNetworkMode: 'testnet',
    apiUrl: 'https://api.testnet-pox5.hiro.so',
    stacksNetworkName: 'testnet',
    bitcoinNetworkMode: 'testnet',
    specialSignerManagerContracts: [
      'ST3FJQK31NMDM594YKP1640V5WESX38ENSSY6DMBF.signer-manager',
      'STXM87M1S5QRGMJ1D4Q4865VBNYZC9YMZAX4FGAA.signer-manager',
    ],
  },
};

export const pox5NetworkConfig = pox5Chains[activePox5Chain];

// Every chain the feature can be pointed at, so the CSP covers all of them and
// flipping the switch above needs no second edit there.
export const pox5ChainApiUrls = Object.values(pox5Chains).map(chain => chain.apiUrl);
