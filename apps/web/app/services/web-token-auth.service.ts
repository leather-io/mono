import { getDefaultStore } from 'jotai';
import { sessionsAtom } from '~/features/multisig/auth/sessions.atom';

import type { AuthSession, ChainNetworkId } from '@leather.io/models';
import type { TokenAuthService } from '@leather.io/services';

export class WebTokenAuthService implements TokenAuthService {
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

  setSession(network: ChainNetworkId, session: AuthSession) {
    this.store.set(sessionsAtom, prev => ({ ...prev, [network]: session }));
  }

  clearSession(network: ChainNetworkId) {
    this.store.set(sessionsAtom, prev => ({ ...prev, [network]: null }));
  }

  onTokenRefreshed(network: ChainNetworkId, accessToken: string) {
    this.store.set(sessionsAtom, prev => {
      const existing = prev[network];
      if (!existing) return prev;
      return { ...prev, [network]: { ...existing, accessToken } };
    });
  }

  onAuthFailure(network: ChainNetworkId) {
    this.clearSession(network);
  }
}
