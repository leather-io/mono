import { injectable } from 'inversify';

import type {
  AuthNetworkId,
  MultisigUser,
  Vault,
  VaultMembershipResult,
  VaultMembershipStatus,
  VaultStatus,
  VaultSummary,
} from '@leather.io/models';

import { LeatherAuthApiClient } from '../infrastructure/api/leather/leather-auth-api.client';

export interface CreateVaultRequest {
  name: string;
  members: string[];
}

export interface UpdateVaultRequest {
  name: string;
}

export interface ListVaultsFilters {
  status?: VaultStatus;
  membershipStatus?: VaultMembershipStatus;
}

@injectable()
export class MultisigService {
  constructor(private readonly authApiClient: LeatherAuthApiClient) {}

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
}
