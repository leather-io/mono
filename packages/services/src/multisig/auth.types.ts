export interface WalletSignInPayload {
  signature: string;
  publicKey: string;
  address: string;
  message: string;
  timestamp: number;
  xpub?: string;
  xpubOriginFingerprint?: string;
  xpubOriginPath?: string;
}

export interface SignInInput {
  network: import('@leather.io/models').ChainNetworkId;
  walletSignIn(params: { message: string; timestamp: number }): Promise<WalletSignInPayload>;
}
