import type { AuthNetworkId, AuthSession } from '@leather.io/models';

export interface AuthSessionService {
  getSession(network: AuthNetworkId): AuthSession | null;
  getActiveNetworks(): AuthNetworkId[];

  onTokenRefreshed(network: AuthNetworkId, accessToken: string): void;
  onAuthFailure(network: AuthNetworkId): void;
}
