export type ChainNetworkId = `${'stx' | 'btc'}:${'mainnet' | 'testnet'}`;

export interface AuthIdentity {
  address: string;
  publicKey: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  identity: AuthIdentity;
}
