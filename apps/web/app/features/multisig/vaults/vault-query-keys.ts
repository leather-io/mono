import type { AuthNetworkId } from '@leather.io/models';
import type { ListVaultsFilters } from '@leather.io/services';

export const multisigVaultKeys = {
  all: ['multisig'] as const,
  me(network: AuthNetworkId) {
    return [...multisigVaultKeys.all, 'me', network] as const;
  },
  lists(network: AuthNetworkId) {
    return [...multisigVaultKeys.all, 'vaults', network] as const;
  },
  list(network: AuthNetworkId, filters?: ListVaultsFilters) {
    return [...multisigVaultKeys.lists(network), filters ?? null] as const;
  },
  detail(network: AuthNetworkId, vaultId: string | undefined) {
    return [...multisigVaultKeys.all, 'vault', network, vaultId ?? null] as const;
  },
};
