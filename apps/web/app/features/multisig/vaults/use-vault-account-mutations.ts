import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { AuthNetworkId, VaultAccount } from '@leather.io/models';
import { type CreateVaultAccountRequest, getMultisigService } from '@leather.io/services';

import { useSession } from '../auth/use-session';
import { multisigVaultKeys } from './vault-query-keys';

export function useCreateVaultAccount(network: AuthNetworkId, vaultId: string) {
  const queryClient = useQueryClient();
  const address = useSession(network)?.identity.address;
  return useMutation<VaultAccount, Error, CreateVaultAccountRequest>({
    mutationKey: ['multisig-create-vault-account', network, vaultId],
    mutationFn(params) {
      return getMultisigService().createVaultAccount(network, vaultId, params);
    },
    onSuccess() {
      void queryClient.invalidateQueries({
        queryKey: multisigVaultKeys.accounts(network, address, vaultId),
      });
      void queryClient.invalidateQueries({
        queryKey: multisigVaultKeys.detail(network, address, vaultId),
      });
    },
  });
}
