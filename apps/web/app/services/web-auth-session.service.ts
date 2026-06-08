import { getDefaultStore } from 'jotai';
import { sessionsAtom } from '~/features/multisig/auth/sessions.atom';

import type { AuthNetworkId } from '@leather.io/models';
import type { AuthSessionService } from '@leather.io/services';

export class WebAuthSessionService implements AuthSessionService {
  private readonly store = getDefaultStore();

  getSession(network: AuthNetworkId) {
    return this.store.get(sessionsAtom)[network];
  }

  getActiveNetworks() {
    const sessions = this.store.get(sessionsAtom);
    return (Object.keys(sessions) as AuthNetworkId[]).filter(network => sessions[network] !== null);
  }

  onTokenRefreshed(network: AuthNetworkId, accessToken: string) {
    this.store.set(sessionsAtom, prev => {
      const existing = prev[network];
      if (!existing) return prev;
      return { ...prev, [network]: { ...existing, accessToken } };
    });
  }

  onAuthFailure(network: AuthNetworkId) {
    this.store.set(sessionsAtom, prev => ({ ...prev, [network]: null }));
  }
}
