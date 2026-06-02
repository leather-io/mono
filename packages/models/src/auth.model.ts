export type ChainNetworkId = `${'stx' | 'btc'}:${'mainnet' | 'testnet'}`;

const authApplications = ['multisig'] as const;
export type AuthApplication = (typeof authApplications)[number];

export interface AuthIdentity {
  address: string;
  publicKey: string;
  network: ChainNetworkId;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  identity: AuthIdentity;
}
