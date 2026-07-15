import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { AuthNetworkId, Vault, VaultMembershipResult } from '@leather.io/models';
import {
  type CreateVaultRequest,
  type UpdateVaultRequest,
  getMultisigService,
} from '@leather.io/services';

import { useSession } from '../auth/use-session';
import { useRecoverVaultAccounts } from './use-vault-account-mutations';
import { multisigVaultKeys } from './vault-query-keys';

export function useCreateVault(network: AuthNetworkId) {
  const queryClient = useQueryClient();
  const address = useSession(network)?.identity.address;
  return useMutation<Vault, Error, CreateVaultRequest>({
    mutationKey: ['multisig-create-vault', network],
    mutationFn(params) {
      return getMultisigService().createVault(network, params);
    },
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: multisigVaultKeys.lists(network, address) });
    },
  });
}

export function useCancelVault(network: AuthNetworkId) {
  const queryClient = useQueryClient();
  const address = useSession(network)?.identity.address;
  return useMutation<Vault, Error, string>({
    mutationKey: ['multisig-cancel-vault', network],
    mutationFn(vaultId) {
      return getMultisigService().cancelVault(network, vaultId);
    },
    onSuccess(_vault, vaultId) {
      void queryClient.invalidateQueries({ queryKey: multisigVaultKeys.lists(network, address) });
      void queryClient.invalidateQueries({
        queryKey: multisigVaultKeys.detail(network, address, vaultId),
      });
    },
  });
}

export function useUpdateVault(network: AuthNetworkId) {
  const queryClient = useQueryClient();
  const address = useSession(network)?.identity.address;
  return useMutation<
    Vault,
    Error,
    { vaultId: string; update: UpdateVaultRequest },
    { previous: Vault | undefined }
  >({
    mutationKey: ['multisig-update-vault', network],
    mutationFn({ vaultId, update }) {
      return getMultisigService().updateVault(network, vaultId, update);
    },
    async onMutate({ vaultId, update }) {
      const key = multisigVaultKeys.detail(network, address, vaultId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Vault>(key);
      if (previous) queryClient.setQueryData<Vault>(key, { ...previous, name: update.name });
      return { previous };
    },
    onError(_error, { vaultId }, context) {
      if (context?.previous) {
        queryClient.setQueryData(
          multisigVaultKeys.detail(network, address, vaultId),
          context.previous
        );
      }
    },
    onSuccess(vault, { vaultId }) {
      queryClient.setQueryData(multisigVaultKeys.detail(network, address, vaultId), vault);
      void queryClient.invalidateQueries({ queryKey: multisigVaultKeys.lists(network, address) });
    },
  });
}

export function useJoinVault(network: AuthNetworkId) {
  const queryClient = useQueryClient();
  const address = useSession(network)?.identity.address;
  const recoverAccounts = useRecoverVaultAccounts(network);
  return useMutation<VaultMembershipResult, Error, string>({
    mutationKey: ['multisig-join-vault', network],
    mutationFn(membershipId) {
      return getMultisigService().joinVault(network, membershipId);
    },
    onSuccess(result) {
      if (result.vault.status === 'active') {
        recoverAccounts.mutate(result.vault.id);
      }
      void queryClient.invalidateQueries({ queryKey: multisigVaultKeys.lists(network, address) });
      void queryClient.invalidateQueries({
        queryKey: multisigVaultKeys.detail(network, address, result.vault.id),
      });
    },
  });
}

export function useDeclineVault(network: AuthNetworkId) {
  const queryClient = useQueryClient();
  const address = useSession(network)?.identity.address;
  return useMutation<VaultMembershipResult, Error, string>({
    mutationKey: ['multisig-decline-vault', network],
    mutationFn(membershipId) {
      return getMultisigService().declineVault(network, membershipId);
    },
    onSuccess(result) {
      void queryClient.invalidateQueries({ queryKey: multisigVaultKeys.lists(network, address) });
      void queryClient.invalidateQueries({
        queryKey: multisigVaultKeys.detail(network, address, result.vault.id),
      });
    },
  });
}
