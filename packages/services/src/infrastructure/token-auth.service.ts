import type { AuthSession, ChainNetworkId } from '@leather.io/models';

export interface TokenAuthService {
  getSession(network: ChainNetworkId): AuthSession | null;
  getActiveNetworks(): ChainNetworkId[];

  setSession(network: ChainNetworkId, session: AuthSession): void;
  clearSession(network: ChainNetworkId): void;

  onTokenRefreshed(network: ChainNetworkId, accessToken: string): void;
  onAuthFailure(network: ChainNetworkId): void;
}
