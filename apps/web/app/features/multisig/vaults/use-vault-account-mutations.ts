import { useMutation, useMutationState, useQueryClient } from '@tanstack/react-query';
import { useToast } from '~/features/toasts/use-toast';

import type { AuthNetworkId, Vault, VaultAccount, VaultAccountSummary } from '@leather.io/models';
import { LeatherApiError, getMultisigService } from '@leather.io/services';

import { useSession } from '../auth/use-session';
import { nextAccountIndexForThreshold } from './vault-account-index';
import { multisigVaultKeys } from './vault-query-keys';

const recoverVaultAccountsMutationKey = 'multisig-recover-vault-accounts';

interface CreateVaultAccountParams {
  name: string;
  icon?: string;
  threshold: number;
}

function isAccountCreateConflict(error: unknown): boolean {
  return LeatherApiError.isLeatherApiError(error) && (error.status === 400 || error.status === 409);
}

export function useCreateVaultAccount(network: AuthNetworkId, vaultId: string) {
  const queryClient = useQueryClient();
  const address = useSession(network)?.identity.address;
  return useMutation<VaultAccount, Error, CreateVaultAccountParams>({
    mutationKey: ['multisig-create-vault-account', network, vaultId],
    async mutationFn({ name, icon, threshold }) {
      const service = getMultisigService();
      const accountsKey = multisigVaultKeys.accounts(network, address, vaultId);
      const knownAccounts =
        queryClient.getQueryData<VaultAccountSummary[]>(accountsKey) ??
        (await service.listVaultAccounts(network, vaultId));
      const index = nextAccountIndexForThreshold(knownAccounts, threshold);
      try {
        return await service.createVaultAccount(network, vaultId, { name, icon, threshold, index });
      } catch (error) {
        if (!isAccountCreateConflict(error)) throw error;
        const freshAccounts = await service.listVaultAccounts(network, vaultId);
        queryClient.setQueryData(accountsKey, freshAccounts);
        const freshIndex = nextAccountIndexForThreshold(freshAccounts, threshold);
        if (freshIndex === index) throw error;
        return service.createVaultAccount(network, vaultId, {
          name,
          icon,
          threshold,
          index: freshIndex,
        });
      }
    },
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: multisigVaultKeys.lists(network, address) });
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
        const vault = queryClient.getQueryData<Vault>(
          multisigVaultKeys.detail(network, address, vaultId)
        );
        const summary = `Recovered ${accounts.length} ${accounts.length === 1 ? 'account' : 'accounts'}`;
        showToast(vault ? `${summary} in “${vault.name}”` : summary);
      }
      void queryClient.invalidateQueries({ queryKey: multisigVaultKeys.lists(network, address) });
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
