import { useMutation } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';

import type { AuthApplication, AuthSession, ChainNetworkId } from '@leather.io/models';
import { buildSignInMessage, getSignInService } from '@leather.io/services';

import { sessionsAtom } from './sessions.atom';
import { walletSignIn } from './wallet-sign-in';

export function useSignIn(network: ChainNetworkId, application: AuthApplication[] = ['multisig']) {
  const setSessions = useSetAtom(sessionsAtom);

  return useMutation<AuthSession, Error, void>({
    mutationKey: ['multisig-auth-sign-in', network, application],
    mutationFn: async () => {
      const { message, timestamp } = buildSignInMessage();
      const payload = await walletSignIn({ network, message, timestamp });
      const session = await getSignInService().signIn({ network, application, payload });
      setSessions(prev => ({ ...prev, [network]: session }));
      return session;
    },
  });
}
