import { useMutation } from '@tanstack/react-query';

import type { AuthSession, ChainNetworkId } from '@leather.io/models';
import { type WalletSignInPayload, getAuthService } from '@leather.io/services';

async function walletSignIn(_params: {
  message: string;
  timestamp: number;
}): Promise<WalletSignInPayload> {
  throw new Error('TODO: wire to extension wallet_signIn RPC once available');
}

export function useSignIn(network: ChainNetworkId) {
  return useMutation<AuthSession, Error, void>({
    mutationKey: ['multisig-auth-sign-in', network],
    mutationFn: () => getAuthService().signIn({ network, walletSignIn }),
  });
}
