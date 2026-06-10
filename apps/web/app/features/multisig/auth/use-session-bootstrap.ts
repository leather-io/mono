import { useEffect, useRef } from 'react';

import { atom, getDefaultStore, useAtomValue } from 'jotai';

import type { AuthNetworkId, AuthSession } from '@leather.io/models';
import { getSignInService, isJwtExpired } from '@leather.io/services';

import { sessionNetworks, sessionsAtom } from './sessions.atom';

const restoringSessionsAtom = atom<AuthNetworkId[]>([]);

export function useIsRestoringSession(network: AuthNetworkId) {
  return useAtomValue(restoringSessionsAtom).includes(network);
}

async function restoreSession(network: AuthNetworkId, session: AuthSession) {
  const store = getDefaultStore();
  store.set(restoringSessionsAtom, prev => [...prev, network]);
  try {
    const restored = await getSignInService().refreshSession(session);
    store.set(sessionsAtom, prev => {
      if (prev[network]?.accessToken !== session.accessToken) return prev;
      return { ...prev, [network]: restored };
    });
  } catch {
    store.set(sessionsAtom, prev => {
      if (prev[network]?.accessToken !== session.accessToken) return prev;
      return { ...prev, [network]: null };
    });
  } finally {
    store.set(restoringSessionsAtom, prev => prev.filter(n => n !== network));
  }
}

export function useSessionBootstrap() {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const sessions = getDefaultStore().get(sessionsAtom);
    for (const network of sessionNetworks) {
      const session = sessions[network];
      if (!session) continue;
      if (!isJwtExpired(session.accessToken)) continue;
      void restoreSession(network, session);
    }
  }, []);
}
