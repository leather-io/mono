import type { AuthApplication, ChainNetworkId } from '@leather.io/models';

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
  network: ChainNetworkId;
  application: AuthApplication[];
  payload: WalletSignInPayload;
}
