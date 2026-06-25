import type { AuthNetworkId } from '@leather.io/models';
import type { ListVaultsFilters } from '@leather.io/services';

export const multisigVaultKeys = {
  all: ['multisig'] as const,
  byNetwork(network: AuthNetworkId) {
    return [...multisigVaultKeys.all, network] as const;
  },
  scope(network: AuthNetworkId, address: string | undefined) {
    return [...multisigVaultKeys.byNetwork(network), address ?? null] as const;
  },
  me(network: AuthNetworkId | undefined, address: string | undefined) {
    return [...multisigVaultKeys.all, network ?? null, address ?? null, 'me'] as const;
  },
  lists(network: AuthNetworkId, address: string | undefined) {
    return [...multisigVaultKeys.scope(network, address), 'vaults'] as const;
  },
  list(network: AuthNetworkId, address: string | undefined, filters?: ListVaultsFilters) {
    return [...multisigVaultKeys.lists(network, address), filters ?? null] as const;
  },
  detail(network: AuthNetworkId, address: string | undefined, vaultId: string | undefined) {
    return [...multisigVaultKeys.scope(network, address), 'vault', vaultId ?? null] as const;
  },
  accounts(network: AuthNetworkId, address: string | undefined, vaultId: string | undefined) {
    return [...multisigVaultKeys.detail(network, address, vaultId), 'accounts'] as const;
  },
  account(network: AuthNetworkId, address: string | undefined, accountId: string | undefined) {
    return [...multisigVaultKeys.scope(network, address), 'account', accountId ?? null] as const;
  },
  accountTransactions(
    network: AuthNetworkId,
    address: string | undefined,
    accountId: string | undefined
  ) {
    return [...multisigVaultKeys.account(network, address, accountId), 'transactions'] as const;
  },
  transaction(network: AuthNetworkId, address: string | undefined, txId: string | undefined) {
    return [...multisigVaultKeys.scope(network, address), 'transaction', txId ?? null] as const;
  },
};
