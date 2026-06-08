import { useAtomValue } from 'jotai';

import type { AuthNetworkId, AuthSession } from '@leather.io/models';

import { sessionsAtom } from './sessions.atom';

export function useSession(network: AuthNetworkId): AuthSession | null {
  return useAtomValue(sessionsAtom)[network];
}
