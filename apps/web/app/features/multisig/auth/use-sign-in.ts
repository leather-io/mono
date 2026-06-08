import { useMutation } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';

import type { AuthApplication, AuthNetworkId, AuthSession } from '@leather.io/models';
import {
  type WalletSignInPayload,
  buildSignInMessage,
  getSignInService,
} from '@leather.io/services';

import { sessionsAtom } from './sessions.atom';

function walletSignIn(params: {
  message: string;
  timestamp: number;
}): Promise<WalletSignInPayload> {
  return Promise.reject(
    new Error(
      `TODO: wire to extension wallet_signIn RPC once available (message=${params.message})`
    )
  );
}

export function useSignIn(network: AuthNetworkId, application: AuthApplication[] = ['multisig']) {
  const setSessions = useSetAtom(sessionsAtom);

  return useMutation<AuthSession, Error, void>({
    mutationKey: ['multisig-auth-sign-in', network, application],
    mutationFn: async () => {
      const { message, timestamp } = buildSignInMessage();
      const payload = await walletSignIn({ message, timestamp });
      const session = await getSignInService().signIn({ network, application, payload });
      setSessions(prev => ({ ...prev, [network]: session }));
      return session;
    },
  });
}
