import { atomWithStorage } from 'jotai/utils';

import type { AuthNetworkId, AuthSession } from '@leather.io/models';

type SessionsRecord = Record<AuthNetworkId, AuthSession | null>;

const defaultSessions: SessionsRecord = {
  'stx:mainnet': null,
  'btc:mainnet': null,
  'stx:testnet': null,
  'btc:testnet': null,
};

export const sessionsAtom = atomWithStorage<SessionsRecord>(
  'leather:multisig:sessions',
  defaultSessions
);
