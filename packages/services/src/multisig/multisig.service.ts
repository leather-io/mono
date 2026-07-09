import { injectable } from 'inversify';

import type {
  AuthNetworkId,
  MultisigTransaction,
  MultisigTransactionSummary,
  MultisigUser,
  Vault,
  VaultAccount,
  VaultAccountSummary,
  VaultMembershipResult,
  VaultMembershipStatus,
  VaultStatus,
  VaultSummary,
} from '@leather.io/models';

import { LeatherApiClient } from '../infrastructure/api/leather/leather-api.client';
import type {
  LeatherApiPage,
  LeatherApiPageRequest,
} from '../infrastructure/api/leather/leather-api.pagination';
import { LeatherAuthApiClient } from '../infrastructure/api/leather/leather-auth-api.client';

export interface CreateVaultRequest {
  name: string;
  theme?: string;
  icon?: string;
  members: { address: string; name?: string }[];
}

export interface UpdateVaultRequest {
  name: string;
  theme?: string | null;
  icon?: string | null;
}

export interface ListVaultsFilters {
  status?: VaultStatus;
  membershipStatus?: VaultMembershipStatus;
}

export interface CreateVaultAccountRequest {
  name: string;
  icon?: string;
  threshold: number;
  index: number;
}

export interface UpdateVaultAccountRequest {
  name: string;
  icon?: string | null;
}

export interface ProposeTransactionRequest {
  multisigAddress: string;
  rawPayload: string;
  proposalSignature: string;
  proposalTimestamp: number;
}

export interface AddTransactionSignaturesRequest {
  signatures: { signature: string; inputIndex?: number }[];
}

@injectable()
export class MultisigService {
  constructor(
    private readonly authApiClient: LeatherAuthApiClient,
    private readonly apiClient: LeatherApiClient
  ) {}

  async getMe(network: AuthNetworkId, signal?: AbortSignal): Promise<MultisigUser> {
    return this.authApiClient.fetchMultisigMe(network, { signal });
  }

  async listVaults(
    network: AuthNetworkId,
    filters?: ListVaultsFilters,
    signal?: AbortSignal
  ): Promise<VaultSummary[]> {
    return this.authApiClient.fetchMultisigVaults(network, filters, { signal });
  }

  async getVault(network: AuthNetworkId, vaultId: string, signal?: AbortSignal): Promise<Vault> {
    return this.authApiClient.fetchMultisigVault(network, vaultId, { signal });
  }

  async createVault(
    network: AuthNetworkId,
    params: CreateVaultRequest,
    signal?: AbortSignal
  ): Promise<Vault> {
    return this.authApiClient.createMultisigVault(network, params, { signal });
  }

  async updateVault(
    network: AuthNetworkId,
    vaultId: string,
    update: UpdateVaultRequest,
    signal?: AbortSignal
  ): Promise<Vault> {
    return this.authApiClient.updateMultisigVault(network, vaultId, update, { signal });
  }

  async cancelVault(network: AuthNetworkId, vaultId: string, signal?: AbortSignal): Promise<Vault> {
    return this.authApiClient.cancelMultisigVault(network, vaultId, { signal });
  }

  async joinVault(
    network: AuthNetworkId,
    membershipId: string,
    signal?: AbortSignal
  ): Promise<VaultMembershipResult> {
    return this.authApiClient.joinMultisigVault(network, membershipId, { signal });
  }

  async declineVault(
    network: AuthNetworkId,
    membershipId: string,
    signal?: AbortSignal
  ): Promise<VaultMembershipResult> {
    return this.authApiClient.declineMultisigVault(network, membershipId, { signal });
  }

  async listVaultAccounts(
    network: AuthNetworkId,
    vaultId: string,
    signal?: AbortSignal
  ): Promise<VaultAccountSummary[]> {
    return this.authApiClient.fetchMultisigVaultAccounts(network, vaultId, { signal });
  }

  async recoverVaultAccounts(
    network: AuthNetworkId,
    vaultId: string,
    signal?: AbortSignal
  ): Promise<VaultAccountSummary[]> {
    return this.authApiClient.recoverMultisigVaultAccounts(network, vaultId, { signal });
  }

  async getVaultAccount(
    network: AuthNetworkId,
    accountId: string,
    signal?: AbortSignal
  ): Promise<VaultAccount> {
    return this.authApiClient.fetchMultisigVaultAccount(network, accountId, { signal });
  }

  async createVaultAccount(
    network: AuthNetworkId,
    vaultId: string,
    params: CreateVaultAccountRequest,
    signal?: AbortSignal
  ): Promise<VaultAccount> {
    return this.authApiClient.createMultisigVaultAccount(network, vaultId, params, { signal });
  }

  async updateVaultAccount(
    network: AuthNetworkId,
    accountId: string,
    update: UpdateVaultAccountRequest,
    signal?: AbortSignal
  ): Promise<VaultAccount> {
    return this.authApiClient.updateMultisigVaultAccount(network, accountId, update, { signal });
  }

  async listVaultAccountTransactions(
    network: AuthNetworkId,
    vaultAccountId: string,
    pageRequest: LeatherApiPageRequest,
    signal?: AbortSignal
  ): Promise<LeatherApiPage<MultisigTransactionSummary>> {
    return this.authApiClient.fetchMultisigVaultAccountTransactions(
      network,
      vaultAccountId,
      pageRequest,
      { signal }
    );
  }

  async getTransaction(
    network: AuthNetworkId,
    transactionId: string,
    signal?: AbortSignal
  ): Promise<MultisigTransaction> {
    return this.authApiClient.fetchMultisigTransaction(network, transactionId, { signal });
  }

  async addTransactionSignatures(
    network: AuthNetworkId,
    transactionId: string,
    request: AddTransactionSignaturesRequest,
    signal?: AbortSignal
  ): Promise<MultisigTransaction> {
    return this.authApiClient.addMultisigTransactionSignatures(network, transactionId, request, {
      signal,
    });
  }

  async cancelTransaction(
    network: AuthNetworkId,
    transactionId: string,
    signal?: AbortSignal
  ): Promise<MultisigTransaction> {
    return this.authApiClient.cancelMultisigTransaction(network, transactionId, { signal });
  }

  async broadcastTransaction(
    network: AuthNetworkId,
    transactionId: string,
    signal?: AbortSignal
  ): Promise<MultisigTransaction> {
    return this.authApiClient.broadcastMultisigTransaction(network, transactionId, { signal });
  }

  async proposeTransaction(
    request: ProposeTransactionRequest,
    signal?: AbortSignal
  ): Promise<MultisigTransaction> {
    return this.apiClient.proposeMultisigTransaction(request, { signal });
  }
}
