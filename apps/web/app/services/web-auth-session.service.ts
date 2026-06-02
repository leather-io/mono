import { getDefaultStore } from 'jotai';
import { sessionsAtom } from '~/features/multisig/auth/sessions.atom';

import type { ChainNetworkId } from '@leather.io/models';
import type { AuthSessionService } from '@leather.io/services';

export class WebAuthSessionService implements AuthSessionService {
  private readonly store = getDefaultStore();

  getSession(network: ChainNetworkId) {
    return this.store.get(sessionsAtom)[network];
  }

  getActiveNetworks() {
    const sessions = this.store.get(sessionsAtom);
    return (Object.keys(sessions) as ChainNetworkId[]).filter(
      network => sessions[network] !== null
    );
  }

  onTokenRefreshed(network: ChainNetworkId, accessToken: string) {
    this.store.set(sessionsAtom, prev => {
      const existing = prev[network];
      if (!existing) return prev;
      return { ...prev, [network]: { ...existing, accessToken } };
    });
  }

  onAuthFailure(network: ChainNetworkId) {
    this.store.set(sessionsAtom, prev => ({ ...prev, [network]: null }));
  }
}
