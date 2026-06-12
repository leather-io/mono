import { useQuery } from '@tanstack/react-query';

import type { AuthNetworkId } from '@leather.io/models';
import { getMultisigService } from '@leather.io/services';

import { useSession } from '../auth/use-session';
import { multisigVaultKeys } from './vault-query-keys';

export function useMultisigMe(network: AuthNetworkId) {
  const session = useSession(network);
  return useQuery({
    queryKey: multisigVaultKeys.me(network),
    queryFn: ({ signal }) => getMultisigService().getMe(network, signal),
    enabled: Boolean(session),
  });
}
