import type { AuthApplication, AuthNetworkId } from '@leather.io/models';

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
  network: AuthNetworkId;
  domain: string;
  application: AuthApplication[];
  payload: WalletSignInPayload;
}
