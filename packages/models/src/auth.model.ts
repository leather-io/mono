export type AuthNetworkId = `${'stx' | 'btc'}:${'mainnet' | 'testnet'}`;

export const authApplications = ['multisig'] as const;
export type AuthApplication = (typeof authApplications)[number];

export interface AuthIdentity {
  address: string;
  publicKey: string;
  network: AuthNetworkId;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  identity: AuthIdentity;
}
