import { z } from 'zod';

import { Blockchains } from '../types';
import { networkConfigurationSchema } from './network.schema';

export const HIRO_API_BASE_URL_MAINNET = 'https://api.hiro.so';
export const HIRO_API_BASE_URL_TESTNET = 'https://api.testnet.hiro.so';
export const HIRO_INSCRIPTIONS_API_URL = 'https://api.hiro.so/ordinals/v1/inscriptions';
export const HIRO_API_BASE_URL_NAKAMOTO_TESTNET = 'https://api.nakamoto.testnet.hiro.so';

export const HIRO_API_BASE_URL_MAINNET_EXTENDED = 'https://api.hiro.so/extended/v1';
export const HIRO_API_BASE_URL_TESTNET_EXTENDED = 'https://api.testnet.hiro.so/extended';

export const BITCOIN_API_BASE_URL_MAINNET = 'https://leather.mempool.space/api';
export const BITCOIN_API_BASE_URL_TESTNET = 'https://leather.mempool.space/testnet/api';
export const BITCOIN_API_BASE_URL_SIGNET = 'https://mempool.space/signet/api';

export const BESTINSLOT_API_BASE_URL_MAINNET = 'https://leatherapi.bestinslot.xyz/v3';
export const BESTINSLOT_API_BASE_URL_TESTNET = 'https://leatherapi_testnet.bestinslot.xyz/v3';

export const STX20_API_BASE_URL_MAINNET = 'https://api.stx20.com/api/v1';

// Copied from @stacks/transactions to avoid dependencies
export enum ChainID {
  Testnet = 2147483648,
  Mainnet = 1,
}

export enum WalletDefaultNetworkConfigurationIds {
  mainnet = 'mainnet',
  testnet = 'testnet',
  signet = 'signet',
  sbtcDevenv = 'sbtcDevenv',
  devnet = 'devnet',
}

export type DefaultNetworkConfigurations = keyof typeof WalletDefaultNetworkConfigurationIds;

const supportedBlockchains = ['stacks', 'bitcoin'] as const;

export type SupportedBlockchains = (typeof supportedBlockchains)[number];

export const networkModes = ['mainnet', 'testnet'] as const;
export const testnetModes = ['testnet', 'regtest', 'signet'] as const;

export type NetworkModes = (typeof networkModes)[number];
type BitcoinTestnetModes = (typeof testnetModes)[number];

export type BitcoinNetworkModes = NetworkModes | BitcoinTestnetModes;

interface BaseChainConfig {
  blockchain: Blockchains;
}

export interface BitcoinChainConfig extends BaseChainConfig {
  blockchain: 'bitcoin';
  bitcoinUrl: string;
  bitcoinNetwork: BitcoinNetworkModes;
}

export interface StacksChainConfig extends BaseChainConfig {
  blockchain: 'stacks';
  url: string;
  /** The chainId of the network (or parent network if this is a subnet) */
  chainId: ChainID;
  /** An additional chainId for subnets. Indicated a subnet if defined and is mainly used for signing. */
  subnetChainId?: ChainID;
}

export type NetworkConfiguration = z.infer<typeof networkConfigurationSchema>;

const networkMainnet: NetworkConfiguration = {
  id: WalletDefaultNetworkConfigurationIds.mainnet,
  name: 'Mainnet',
  chain: {
    stacks: {
      blockchain: 'stacks',
      chainId: ChainID.Mainnet,
      url: HIRO_API_BASE_URL_MAINNET,
    },
    bitcoin: {
      blockchain: 'bitcoin',
      bitcoinNetwork: 'mainnet',
      bitcoinUrl: BITCOIN_API_BASE_URL_MAINNET,
    },
  },
};

const networkTestnet: NetworkConfiguration = {
  id: WalletDefaultNetworkConfigurationIds.testnet,
  name: 'Testnet',
  chain: {
    stacks: {
      blockchain: 'stacks',
      chainId: ChainID.Testnet,
      url: HIRO_API_BASE_URL_TESTNET,
    },
    bitcoin: {
      blockchain: 'bitcoin',
      bitcoinNetwork: 'testnet',
      bitcoinUrl: BITCOIN_API_BASE_URL_TESTNET,
    },
  },
};

const networkSignet: NetworkConfiguration = {
  id: WalletDefaultNetworkConfigurationIds.signet,
  name: 'Signet',
  chain: {
    stacks: {
      blockchain: 'stacks',
      chainId: ChainID.Testnet,
      url: HIRO_API_BASE_URL_TESTNET,
    },
    bitcoin: {
      blockchain: 'bitcoin',
      bitcoinNetwork: 'signet',
      bitcoinUrl: BITCOIN_API_BASE_URL_SIGNET,
    },
  },
};

const networkSbtcDevenv: NetworkConfiguration = {
  id: WalletDefaultNetworkConfigurationIds.sbtcDevenv,
  name: 'sBTC Devenv',
  chain: {
    stacks: {
      blockchain: 'stacks',
      chainId: ChainID.Testnet,
      url: 'http://localhost:3999',
    },
    bitcoin: {
      blockchain: 'bitcoin',
      bitcoinNetwork: 'regtest',
      bitcoinUrl: 'http://localhost:8999/api',
    },
  },
};

const networkDevnet: NetworkConfiguration = {
  id: WalletDefaultNetworkConfigurationIds.devnet,
  name: 'Devnet',
  chain: {
    stacks: {
      blockchain: 'stacks',
      chainId: ChainID.Testnet,
      url: 'http://localhost:3999',
    },
    bitcoin: {
      blockchain: 'bitcoin',
      bitcoinNetwork: 'regtest',
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
  [WalletDefaultNetworkConfigurationIds.testnet]: networkTestnet,
  [WalletDefaultNetworkConfigurationIds.signet]: networkSignet,
  [WalletDefaultNetworkConfigurationIds.sbtcDevenv]: networkSbtcDevenv,
  [WalletDefaultNetworkConfigurationIds.devnet]: networkDevnet,
};
