export type AuthNetworkId =
  | `stx:${'mainnet' | 'testnet'}`
  | `btc:${'mainnet' | 'testnet' | 'regtest'}`;

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
