import type { AuthSession, ChainNetworkId } from '@leather.io/models';

export interface AuthSessionService {
  getSession(network: ChainNetworkId): AuthSession | null;
  getActiveNetworks(): ChainNetworkId[];

  onTokenRefreshed(network: ChainNetworkId, accessToken: string): void;
  onAuthFailure(network: ChainNetworkId): void;
}
