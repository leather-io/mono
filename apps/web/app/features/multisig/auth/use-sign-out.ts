import { useCallback } from 'react';

import { useSetAtom } from 'jotai';

import type { ChainNetworkId } from '@leather.io/models';

import { sessionsAtom } from './sessions.atom';

export function useSignOut(network: ChainNetworkId) {
  const setSessions = useSetAtom(sessionsAtom);
  return useCallback(() => {
    setSessions(prev => ({ ...prev, [network]: null }));
  }, [setSessions, network]);
}
