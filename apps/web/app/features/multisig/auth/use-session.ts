import { useAtomValue } from 'jotai';

import type { AuthNetworkId, AuthSession } from '@leather.io/models';

import { sessionsAtom } from './sessions.atom';

export function useSession(network: AuthNetworkId | undefined): AuthSession | null {
  const sessions = useAtomValue(sessionsAtom);
  return network ? (sessions[network] ?? null) : null;
}
