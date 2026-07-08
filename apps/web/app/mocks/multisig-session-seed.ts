import type { AuthNetworkId, AuthSession } from '@leather.io/models';

import { makeMockSession } from './api/leather.io/multisig';

const sessionsKey = 'leather:multisig:sessions';
const seededNetworks: AuthNetworkId[] = [
  'stx:mainnet',
  'btc:mainnet',
  'stx:testnet',
  'btc:testnet',
  'btc:regtest',
];

export function seedMultisigMockSessions(): void {
  const expSeconds = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
  const record: Record<string, AuthSession> = {};
  for (const network of seededNetworks) {
    record[network] = makeMockSession(network, expSeconds);
  }
  localStorage.setItem(sessionsKey, JSON.stringify(record));
}
