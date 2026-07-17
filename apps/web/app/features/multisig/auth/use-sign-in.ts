import { useMutation } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';

import type { AuthApplication, AuthNetworkId, AuthSession } from '@leather.io/models';
import { buildSignInMessage, getSignInService } from '@leather.io/services';

import { sessionsAtom } from './sessions.atom';
import { walletSignIn } from './wallet-sign-in';

const signInMessageMaxAgeSeconds = 5 * 60;

export function useSignIn(network: AuthNetworkId, application: AuthApplication[] = ['multisig']) {
  const setSessions = useSetAtom(sessionsAtom);

  return useMutation<AuthSession, Error, void>({
    mutationKey: ['multisig-auth-sign-in', network, application],
    mutationFn: async () => {
      const { message, timestamp } = buildSignInMessage(network);
      const payload = await walletSignIn({ network, message, timestamp });
      if (Math.floor(Date.now() / 1000) - timestamp > signInMessageMaxAgeSeconds) {
        throw new Error('Sign-in expired. The message has a 5-minute expiry, so please try again.');
      }
      const session = await getSignInService().signIn({ network, application, payload });
      setSessions(prev => ({ ...prev, [network]: session }));
      return session;
    },
  });
}
