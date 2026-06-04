import { atomWithStorage } from 'jotai/utils';

import type { AuthSession, ChainNetworkId } from '@leather.io/models';

type SessionsRecord = Record<ChainNetworkId, AuthSession | null>;

export const sessionNetworks: ChainNetworkId[] = [
  'stx:mainnet',
  'btc:mainnet',
  'stx:testnet',
  'btc:testnet',
];

const defaultSessions: SessionsRecord = {
  'stx:mainnet': null,
  'btc:mainnet': null,
  'stx:testnet': null,
  'btc:testnet': null,
};

export const sessionsAtom = atomWithStorage<SessionsRecord>(
  'leather:multisig:sessions',
  defaultSessions,
  undefined,
  { getOnInit: true }
);
