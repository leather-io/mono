import type {
  AccountAddresses,
  BtcStakingPosition,
  BtcStakingPositionStatus,
} from '@leather.io/models';
import type { BadgeProps } from '@leather.io/ui';

interface PositionBadge {
  label: string;
  variant: BadgeProps['variant'];
}

const positionStatusBadgeMap: Record<BtcStakingPositionStatus, PositionBadge> = {
  locked: { label: 'Active', variant: 'success' },
  exiting: { label: 'Exiting', variant: 'warning' },
  matured: { label: 'Unlocked', variant: 'info' },
  reclaimed: { label: 'Reclaimed', variant: 'default' },
  exited: { label: 'Exited', variant: 'default' },
};

const upcomingBadge: PositionBadge = { label: 'Upcoming', variant: 'default' };

export function getPositionBadge(position: BtcStakingPosition): PositionBadge {
  if (position.status === 'locked' && position.bond.status === 'upcoming') return upcomingBadge;
  return positionStatusBadgeMap[position.status];
}

export function describeHeldBy(account: AccountAddresses): string {
  const bitcoin = account.bitcoin;
  if (bitcoin?.type === 'fixedAddress' && bitcoin.multisig) {
    return `Vault ${bitcoin.multisig.threshold} of ${bitcoin.multisig.signerCount}, timelock script`;
  }
  return 'Your key, timelock script';
}

export function getRenewalOpensAt(positions: BtcStakingPosition[]): Date | undefined {
  if (positions.some(position => position.status === 'matured')) return undefined;
  const lockedPositions = positions.filter(position => position.status === 'locked');
  if (lockedPositions.length === 0) return undefined;
  return new Date(
    Math.min(...lockedPositions.map(position => position.estimatedUnlockAt.getTime()))
  );
}

const estimatedDateFormat = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' });

export function formatEstimatedDate(date: Date): string {
  return estimatedDateFormat.format(date);
}

export function formatBlockHeight(height: number): string {
  return `block ${height.toLocaleString()}`;
}
