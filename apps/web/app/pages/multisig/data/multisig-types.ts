// Domain types for the multisig UI. These are local interfaces, not
// @leather.io/models types: the prototype pre-formats every amount as a display
// string (e.g. "118,250 STX") and uses a plain number for USD, so forcing Money
// here would add reformatting logic with no UI benefit for a design-only port.
// Production extraction is where Money + formatting are introduced.

export type Chain = 'btc' | 'stx';

type MemberRole = 'Admin' | 'Member';

type InviteStatus = 'invited' | 'joined' | 'declined';

type VaultStatus = 'pending' | 'active' | 'cancelled';

// queued is STX-only (waiting on a prior nonce); a BTC tx is never queued.
export type TxStatus =
  | 'queued'
  | 'pending'
  | 'signed'
  | 'broadcast'
  | 'confirmed'
  | 'failed'
  | 'dropped'
  | 'cancelled';

export const txStatusLabel: Record<TxStatus, string> = {
  queued: 'Queued',
  pending: 'Collecting signatures',
  signed: 'Ready to broadcast',
  broadcast: 'Broadcasting…',
  confirmed: 'Confirmed',
  failed: 'Failed',
  dropped: 'Dropped',
  cancelled: 'Cancelled',
};

export interface Member {
  name: string;
  handle: string;
  addr: string;
  role: MemberRole;
  isCreator: boolean;
  inviteStatus: InviteStatus;
  joinedAt: string | null;
}

// Per-account binding of one of the user's personal wallet accounts to a vault
// account. userId === 'me' marks proposers belonging to the signed-in user, so
// the Send flow can show a picker when there are 2+ of them.
export interface Proposer {
  fingerprint: string;
  accountIndex: number;
  wallet: string;
  account: string;
  userId: string;
}

export interface MultisigAccount {
  id: string;
  name: string;
  icon: string;
  addr: string;
  balanceUsd: number;
  balanceSub: string;
  threshold: [number, number];
  proposers: Proposer[];
}

export interface MultisigTransaction {
  id: string;
  kind: string;
  title: string;
  sub: string;
  status: TxStatus;
  amount: string;
  amountUsd: string;
  time: string;
  highlight?: boolean;
  accountId: string;
  proposerName: string;
  proposerUserId: string;
  proposedAt: string;
  signed: string[];
  required: number;
}

export interface Vault {
  id: string;
  name: string;
  chain: Chain;
  theme: number;
  status: VaultStatus;
  balanceUsd: number;
  balanceSub: string;
  members: Member[];
  inviter: string;
  inviteToken: string;
  createdAt: string;
  invited: boolean;
  accounts: MultisigAccount[];
  transactions: MultisigTransaction[];
}

// Shape produced by the Create Vault form's member rows.
export interface NewMemberInput {
  addr: string;
  name: string;
  isMe?: boolean;
}
