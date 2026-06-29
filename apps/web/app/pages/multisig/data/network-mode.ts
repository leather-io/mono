import type { AuthNetworkId } from '@leather.io/models';

import type { Chain } from './multisig-types';

export type NetworkMode = 'mainnet' | 'testnet';

interface NetworkModeTone {
  background: string;
  border: string;
  text: string;
}

interface NetworkModeInfo {
  id: NetworkMode;
  label: string;
  networks: Record<Chain, AuthNetworkId>;
  isProduction: boolean;
  tone: NetworkModeTone;
}

export const networkModeInfo: Record<NetworkMode, NetworkModeInfo> = {
  mainnet: {
    id: 'mainnet',
    label: 'Mainnet',
    networks: { btc: 'btc:mainnet', stx: 'stx:mainnet' },
    isProduction: true,
    tone: {
      background: 'ink.background-secondary',
      border: 'ink.border-default',
      text: 'ink.text-primary',
    },
  },
  testnet: {
    id: 'testnet',
    label: 'Testnet',
    networks: { btc: 'btc:testnet', stx: 'stx:testnet' },
    isProduction: false,
    tone: {
      background: 'yellow.background-primary',
      border: 'yellow.border',
      text: 'yellow.text-primary',
    },
  },
};

export const orderedNetworkModes: NetworkMode[] = ['mainnet', 'testnet'];

export function chainNetworkSummary(mode: NetworkMode): string {
  const { networks } = networkModeInfo[mode];
  return `${networks.btc} · ${networks.stx}`;
}
