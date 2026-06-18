import { useQuery } from '@tanstack/react-query';

import type { AuthNetworkId } from '@leather.io/models';
import { getMultisigService } from '@leather.io/services';

import { useSession } from '../auth/use-session';
import { multisigVaultKeys } from './vault-query-keys';

export function useMultisigMe(network: AuthNetworkId | undefined) {
  const session = useSession(network);
  return useQuery({
    queryKey: multisigVaultKeys.me(network, session?.identity.address),
    queryFn: ({ signal }) => {
      if (!network) throw new Error('useMultisigMe requires a network');
      return getMultisigService().getMe(network, signal);
    },
    enabled: Boolean(network) && Boolean(session),
  });
}
