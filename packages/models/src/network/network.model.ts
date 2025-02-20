import { z } from 'zod';

import { Blockchain } from '../types';
import { networkConfigurationSchema } from './network.schema';

export const HIRO_API_BASE_URL_MAINNET = 'https://api.hiro.so';
export const HIRO_API_BASE_URL_TESTNET = 'https://api.testnet.hiro.so';
export const HIRO_INSCRIPTIONS_API_URL = 'https://api.hiro.so/ordinals/v1/inscriptions';
export const HIRO_API_BASE_URL_NAKAMOTO_TESTNET = 'https://api.nakamoto.testnet.hiro.so';

export const HIRO_API_BASE_URL_MAINNET_EXTENDED = 'https://api.hiro.so/extended/v1';
export const HIRO_API_BASE_URL_TESTNET_EXTENDED = 'https://api.testnet.hiro.so/extended';

export const BITCOIN_API_BASE_URL_MAINNET = 'https://leather.mempool.space/api';
export const BITCOIN_API_BASE_URL_TESTNET3 = 'https://leather.mempool.space/testnet/api';
export const BITCOIN_API_BASE_URL_TESTNET4 = 'https://leather.mempool.space/testnet4/api';
export const BITCOIN_API_BASE_URL_SIGNET = 'https://mempool.space/signet/api';

export const BESTINSLOT_API_BASE_URL_MAINNET = 'https://leatherapi.bestinslot.xyz/v3';
export const BESTINSLOT_API_BASE_URL_TESTNET = 'https://leatherapi_testnet.bestinslot.xyz/v3';

export const STX20_API_BASE_URL_MAINNET = 'https://api.stx20.com/api/v1';

export const BNS_V2_API_BASE_URL = 'https://api.bnsv2.com';

// Copied from @stacks/transactions to avoid dependencies
export enum ChainId {
  Testnet = 2147483648,
  Mainnet = 1,
}

export enum WalletDefaultNetworkConfigurationIds {
  mainnet = 'mainnet',
  testnet = 'testnet',
  testnet4 = 'testnet4',
  signet = 'signet',
  sbtcTestnet = 'sbtcTestnet',
  sbtcDevenv = 'sbtcDevenv',
  devnet = 'devnet',
}

export type DefaultNetworkConfigurations = keyof typeof WalletDefaultNetworkConfigurationIds;

export const supportedBlockchains = ['stacks', 'bitcoin'] as const;

export type SupportedBlockchains = (typeof supportedBlockchains)[number];

export const networkModes = ['mainnet', 'testnet'] as const;
export const testnetModes = ['testnet', 'regtest', 'signet'] as const;

export const bitcoinNetworks = ['mainnet', 'testnet3', 'testnet4', 'regtest', 'signet'] as const;
export type BitcoinNetwork = (typeof bitcoinNetworks)[number];

export type NetworkModes = (typeof networkModes)[number];
type BitcoinTestnetModes = (typeof testnetModes)[number];

export function bitcoinNetworkToNetworkMode(network: BitcoinNetwork): BitcoinNetworkModes {
  switch (network) {
    case 'mainnet':
      return 'mainnet';
    case 'testnet3':
      return 'testnet';
    case 'testnet4':
      return 'testnet';
    case 'regtest':
      return 'regtest';
    case 'signet':
      return 'signet';
    default:
      // TODO: Needs exhaustive check. Cannot import 'assertUnreachable' since 'utils' package depends on 'models'.
      //       Ideally this function should live in utils, but it's currently widely used in the extension.
      throw new Error(`Unhandled case: ${network}`);
  }
}

export type BitcoinNetworkModes = NetworkModes | BitcoinTestnetModes;

interface BaseChainConfig {
  blockchain: Blockchain;
}

export interface BitcoinChainConfig extends BaseChainConfig {
  blockchain: 'bitcoin';
  bitcoinUrl: string;
  bitcoinNetwork: BitcoinNetwork;
  mode: BitcoinNetworkModes;
}

export interface StacksChainConfig extends BaseChainConfig {
  blockchain: 'stacks';
  url: string;
  /** The chainId of the network (or parent network if this is a subnet) */
  chainId: ChainId;
  /** An additional chainId for subnets. Indicated a subnet if defined and is mainly used for signing. */
  subnetChainId?: ChainId;
}

export type NetworkConfiguration = z.infer<typeof networkConfigurationSchema>;

const networkMainnet: NetworkConfiguration = {
  id: WalletDefaultNetworkConfigurationIds.mainnet,
  name: 'Mainnet',
  chain: {
    stacks: {
      blockchain: 'stacks',
      chainId: ChainId.Mainnet,
      url: HIRO_API_BASE_URL_MAINNET,
    },
    bitcoin: {
      blockchain: 'bitcoin',
      bitcoinNetwork: 'mainnet',
      mode: 'mainnet',
      bitcoinUrl: BITCOIN_API_BASE_URL_MAINNET,
    },
  },
};

const networkTestnet: NetworkConfiguration = {
  id: WalletDefaultNetworkConfigurationIds.testnet,
  name: 'Testnet3',
  chain: {
    stacks: {
      blockchain: 'stacks',
      chainId: ChainId.Testnet,
      url: HIRO_API_BASE_URL_TESTNET,
    },
    bitcoin: {
      blockchain: 'bitcoin',
      bitcoinNetwork: 'testnet3',
      mode: 'testnet',
      bitcoinUrl: BITCOIN_API_BASE_URL_TESTNET3,
    },
  },
};

const networkTestnet4: NetworkConfiguration = {
  id: WalletDefaultNetworkConfigurationIds.testnet4,
  name: 'Testnet4',
  chain: {
    stacks: {
      blockchain: 'stacks',
      chainId: ChainId.Testnet,
      url: HIRO_API_BASE_URL_TESTNET,
    },
    bitcoin: {
      blockchain: 'bitcoin',
      bitcoinNetwork: 'testnet4',
      mode: 'testnet',
      bitcoinUrl: BITCOIN_API_BASE_URL_TESTNET4,
    },
  },
};

const networkSignet: NetworkConfiguration = {
  id: WalletDefaultNetworkConfigurationIds.signet,
  name: 'Signet',
  chain: {
    stacks: {
      blockchain: 'stacks',
      chainId: ChainId.Testnet,
      url: HIRO_API_BASE_URL_TESTNET,
    },
    bitcoin: {
      blockchain: 'bitcoin',
      bitcoinNetwork: 'signet',
      mode: 'signet',
      bitcoinUrl: BITCOIN_API_BASE_URL_SIGNET,
    },
  },
};

const networkSbtcTestnet: NetworkConfiguration = {
  id: WalletDefaultNetworkConfigurationIds.sbtcTestnet,
  name: 'sBTC Testnet',
  chain: {
    stacks: {
      blockchain: 'stacks',
      chainId: ChainId.Testnet,
      url: HIRO_API_BASE_URL_TESTNET,
    },
    bitcoin: {
      blockchain: 'bitcoin',
      bitcoinNetwork: 'regtest',
      mode: 'regtest',
      bitcoinUrl: 'https://beta.sbtc-mempool.tech/api/proxy',
    },
  },
};

const networkSbtcDevenv: NetworkConfiguration = {
  id: WalletDefaultNetworkConfigurationIds.sbtcDevenv,
  name: 'sBTC Devenv',
  chain: {
    stacks: {
      blockchain: 'stacks',
      chainId: ChainId.Testnet,
      url: 'http://localhost:3999',
    },
    bitcoin: {
      blockchain: 'bitcoin',
      bitcoinNetwork: 'regtest',
      mode: 'regtest',
      bitcoinUrl: 'http://localhost:3000/api/proxy',
    },
  },
};

const networkDevnet: NetworkConfiguration = {
  id: WalletDefaultNetworkConfigurationIds.devnet,
  name: 'Devnet',
  chain: {
    stacks: {
      blockchain: 'stacks',
      chainId: ChainId.Testnet,
      url: 'http://localhost:3999',
    },
    bitcoin: {
      blockchain: 'bitcoin',
      bitcoinNetwork: 'regtest',
      mode: 'regtest',
      bitcoinUrl: 'http://localhost:18443',
    },
  },
};

export const defaultCurrentNetwork: NetworkConfiguration = networkMainnet;

export const defaultNetworksKeyedById: Record<
  WalletDefaultNetworkConfigurationIds,
  NetworkConfiguration
> = {
  [WalletDefaultNetworkConfigurationIds.mainnet]: networkMainnet,
  [WalletDefaultNetworkConfigurationIds.testnet4]: networkTestnet4,
  [WalletDefaultNetworkConfigurationIds.testnet]: networkTestnet,
  [WalletDefaultNetworkConfigurationIds.signet]: networkSignet,
  [WalletDefaultNetworkConfigurationIds.sbtcTestnet]: networkSbtcTestnet,
  [WalletDefaultNetworkConfigurationIds.sbtcDevenv]: networkSbtcDevenv,
  [WalletDefaultNetworkConfigurationIds.devnet]: networkDevnet,
};
