import type { ColorToken } from 'leather-styles/tokens';

import type { AuthNetworkId } from '@leather.io/models';

import type { Chain } from './multisig-types';

export type NetworkMode = 'mainnet' | 'testnet';

interface NetworkModeTone {
  background: ColorToken;
  border: ColorToken;
  text: ColorToken;
  glow: ColorToken;
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
      glow: 'ink.background-secondary',
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
      glow: 'yellow.action-primary-default',
    },
  },
};

export const orderedNetworkModes: NetworkMode[] = ['mainnet', 'testnet'];

export function chainNetworkSummary(mode: NetworkMode): string {
  const { networks } = networkModeInfo[mode];
  return `${networks.btc} · ${networks.stx}`;
}
