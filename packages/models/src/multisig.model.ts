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
  readonly name: string | null;
  readonly membershipStatus: VaultMembershipStatus;
  readonly user: VaultMemberUser | null;
}

interface VaultBase {
  readonly id: string;
  readonly name: string;
  readonly theme: string | null;
  readonly icon: string | null;
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
  readonly icon: string | null;
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

export const multisigTransactionStatuses = [
  'queued',
  'pending',
  'signed',
  'broadcast',
  'confirmed',
  'failed',
  'dropped',
  'cancelled',
] as const;
export type MultisigTransactionStatus = (typeof multisigTransactionStatuses)[number];

export interface MultisigTransactionSignature {
  readonly userId: string;
  readonly signerIndex: number;
  readonly signature: string;
  readonly inputIndex: number | null;
  readonly createdAt: string;
}

export interface MultisigTransactionSummary {
  readonly id: string;
  readonly vaultAccountId: string;
  readonly network: AuthNetworkId;
  readonly proposerUserId: string;
  readonly proposalTimestamp: number;
  readonly nonce: number | null;
  readonly txId: string | null;
  readonly status: MultisigTransactionStatus;
  readonly broadcastAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly approvalCount: number;
}

export interface MultisigTransaction {
  readonly id: string;
  readonly vaultAccountId: string;
  readonly network: AuthNetworkId;
  readonly proposerUserId: string;
  readonly proposalRawPayload: string;
  readonly proposalSignature: string;
  readonly proposalTimestamp: number;
  readonly proposalHash: string;
  readonly nonce: number | null;
  readonly txId: string | null;
  readonly status: MultisigTransactionStatus;
  readonly signatures: readonly MultisigTransactionSignature[];
  readonly broadcastAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}
