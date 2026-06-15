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

export interface VaultAccountSigner {
  readonly network: AuthNetworkId;
  readonly publicKey: string;
  readonly address: string;
  readonly id: string;
  readonly xpub: string | null;
  readonly xpubOriginFingerprint: string | null;
  readonly xpubOriginPath: string | null;
  readonly signerIndex: number;
  readonly signingPubkey: string;
  readonly derivationIndex: number | null;
}

interface VaultAccountBase {
  readonly id: string;
  readonly vaultId: string;
  readonly name: string;
  readonly network: AuthNetworkId;
  readonly threshold: number;
  readonly multisigAddress: string;
  readonly accountIndex: number;
  readonly createdAt: string;
}

export interface VaultAccountSummary extends VaultAccountBase {
  readonly signerCount: number;
}

export interface VaultAccount extends VaultAccountBase {
  readonly signers: readonly VaultAccountSigner[];
  readonly pendingTransactionCount: number;
  readonly queuedTransactionCount: number;
}
