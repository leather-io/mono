import { useMutation, useMutationState, useQueryClient } from '@tanstack/react-query';
import { useToast } from '~/features/toasts/use-toast';

import type { AuthNetworkId, VaultAccount, VaultAccountSummary } from '@leather.io/models';
import { type CreateVaultAccountRequest, getMultisigService } from '@leather.io/services';

import { useSession } from '../auth/use-session';
import { multisigVaultKeys } from './vault-query-keys';

const recoverVaultAccountsMutationKey = 'multisig-recover-vault-accounts';

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

export function useRecoverVaultAccounts(network: AuthNetworkId) {
  const queryClient = useQueryClient();
  const address = useSession(network)?.identity.address;
  const { success: showToast } = useToast();
  return useMutation<VaultAccountSummary[], Error, string>({
    mutationKey: [recoverVaultAccountsMutationKey, network],
    mutationFn(vaultId) {
      return getMultisigService().recoverVaultAccounts(network, vaultId);
    },
    onSuccess(accounts, vaultId) {
      if (accounts.length > 0) {
        showToast(
          `Found ${accounts.length} existing ${accounts.length === 1 ? 'account' : 'accounts'}`
        );
      }
      void queryClient.invalidateQueries({
        queryKey: multisigVaultKeys.accounts(network, address, vaultId),
      });
      void queryClient.invalidateQueries({
        queryKey: multisigVaultKeys.detail(network, address, vaultId),
      });
    },
  });
}

export function useVaultAccountRecovery(network: AuthNetworkId, vaultId: string | undefined) {
  const recoverAccounts = useRecoverVaultAccounts(network);
  const statuses = useMutationState({
    filters: {
      mutationKey: [recoverVaultAccountsMutationKey, network],
      predicate: mutation => mutation.state.variables === vaultId,
    },
    select: mutation => mutation.state.status,
  });
  const status = statuses[statuses.length - 1];
  return {
    isRecovering: status === 'pending',
    recoveryFailed: status === 'error',
    retry() {
      if (vaultId) recoverAccounts.mutate(vaultId);
    },
  };
}
