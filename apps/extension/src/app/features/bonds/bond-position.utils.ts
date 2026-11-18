import type { BtcStakingPosition, Money } from '@leather.io/models';
import { createMoney, sumMoney } from '@leather.io/utils';

const dayMs = 24 * 60 * 60 * 1000;

const endingSoonThresholdDays = 7;

const pastStatuses: BtcStakingPosition['status'][] = ['reclaimed', 'exited'];

export function isCurrentPosition(position: BtcStakingPosition) {
  return !pastStatuses.includes(position.status);
}

export function isUpcomingPosition(position: BtcStakingPosition) {
  return position.status === 'locked' && position.bond.status === 'upcoming';
}

export function daysUntil(date: Date, now = new Date()) {
  return Math.max(0, Math.ceil((date.getTime() - now.getTime()) / dayMs));
}

export function isEndingSoon(position: BtcStakingPosition, now = new Date()) {
  if (position.status !== 'locked' || position.bond.status !== 'active') return false;
  const days = (position.estimatedUnlockAt.getTime() - now.getTime()) / dayMs;
  return days > 0 && days <= endingSoonThresholdDays;
}

export function sortByUnlock(positions: BtcStakingPosition[]) {
  return [...positions].sort(
    (a, b) => a.estimatedUnlockAt.getTime() - b.estimatedUnlockAt.getTime()
  );
}

export function sumBondStx(positions: BtcStakingPosition[]): Money {
  const stacked = positions
    .filter(isCurrentPosition)
    .filter(position => !isUpcomingPosition(position))
    .flatMap(position => (position.stxStacked ? [position.stxStacked] : []));
  return stacked.length ? sumMoney(stacked) : createMoney(0, 'STX');
}

export function subtractMoneyFloor(a: Money, b: Money): Money {
  const diff = a.amount.minus(b.amount);
  return createMoney(diff.isNegative() ? 0 : diff, a.symbol);
}

export function findEndingSoonPosition(positions: BtcStakingPosition[], now = new Date()) {
  return sortByUnlock(positions.filter(position => isEndingSoon(position, now)))[0];
}

export function findMaturedPosition(positions: BtcStakingPosition[]) {
  return positions.find(position => position.status === 'matured');
}

const shortDateFormat = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' });

export function formatShortDate(date: Date) {
  return shortDateFormat.format(date);
}
