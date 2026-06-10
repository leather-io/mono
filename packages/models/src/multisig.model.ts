import { AuthIdentity, AuthNetworkId } from './auth.model';

export const vaultStatuses = ['pending', 'active', 'cancelled'] as const;
export type VaultStatus = (typeof vaultStatuses)[number];

export const vaultMembershipStatuses = ['invited', 'joined', 'declined'] as const;
export type VaultMembershipStatus = (typeof vaultMembershipStatuses)[number];

export const multisigUserStatuses = ['active', 'banned'] as const;
export type MultisigUserStatus = (typeof multisigUserStatuses)[number];

export interface MultisigIdentity extends AuthIdentity {
  readonly id: string;
}

export interface MultisigUser extends MultisigIdentity {
  readonly status: MultisigUserStatus;
}

export interface VaultMemberUser extends MultisigIdentity {
  readonly xpub: string | null;
  readonly xpubOriginFingerprint: string | null;
  readonly xpubOriginPath: string | null;
}

export interface VaultMember {
  readonly membershipId: string;
  readonly address: string;
  readonly membershipStatus: VaultMembershipStatus;
  readonly user: VaultMemberUser | null;
}

interface VaultBase {
  readonly id: string;
  readonly name: string;
  readonly network: AuthNetworkId;
  readonly status: VaultStatus;
  readonly createdBy: string;
  readonly createdAt: string;
}

export interface VaultSummary extends VaultBase {
  readonly membershipStatus: VaultMembershipStatus;
  readonly memberCount: number;
  readonly accountCount: number;
}

export interface Vault extends VaultBase {
  readonly members: readonly VaultMember[];
}

export interface VaultMembershipResult {
  readonly membership: VaultMember;
  readonly vault: Vault;
}
