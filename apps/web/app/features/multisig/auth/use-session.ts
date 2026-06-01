import { useAtomValue } from 'jotai';

import type { AuthSession, ChainNetworkId } from '@leather.io/models';

import { sessionsAtom } from './sessions.atom';

export function useSession(network: ChainNetworkId): AuthSession | null {
  return useAtomValue(sessionsAtom)[network];
}
