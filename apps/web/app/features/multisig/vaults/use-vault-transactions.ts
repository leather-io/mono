import { useQuery } from '@tanstack/react-query';

import type { AuthNetworkId } from '@leather.io/models';
import { getMultisigService } from '@leather.io/services';

import { useSession } from '../auth/use-session';
import { retryMultisigQuery } from './use-vaults';
import { multisigVaultKeys } from './vault-query-keys';

export function useMultisigTransaction(network: AuthNetworkId, txId: string | undefined) {
  const session = useSession(network);
  return useQuery({
    queryKey: multisigVaultKeys.transaction(network, session?.identity.address, txId),
    queryFn: ({ signal }) => {
      if (!txId) throw new Error('useMultisigTransaction requires a txId');
      return getMultisigService().getTransaction(network, txId, signal);
    },
    enabled: Boolean(session) && Boolean(txId),
    retry: retryMultisigQuery,
  });
}
