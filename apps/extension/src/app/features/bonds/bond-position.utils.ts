import type { Money } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import type { BondContext, BondPeriodSchedule, BondPosition } from './bond-position.model';

const secondsPerBurnBlock = 600;
const burnBlocksPerDay = (24 * 60 * 60) / secondsPerBurnBlock;

/** A bond whose unlock is within this many blocks is surfaced as "ending soon" */
export const endingSoonThresholdBlocks = 7 * burnBlocksPerDay;

export function bondLockedBtc(position: BondPosition): Money {
  return createMoney(position.amountSats, 'BTC');
}

export function bondLockedStx(position: BondPosition): Money {
  return createMoney(position.amountUstx, 'STX');
}

export function bondPaidOutBtc(position: BondPosition): Money {
  return createMoney(position.paidOutSats, 'BTC');
}

/** `a - b`, clamped at zero. Used to split "locked" into "in a bond" and the rest. */
export function subtractMoneyFloor(a: Money, b: Money): Money {
  const diff = a.amount.minus(b.amount);
  return createMoney(diff.isNegative() ? 0 : diff, a.symbol);
}

export function blocksUntil(targetBurnHeight: number, ctx: Pick<BondContext, 'burnBlockHeight'>) {
  return targetBurnHeight - ctx.burnBlockHeight;
}

export function isEndingSoon(position: BondPosition, ctx: Pick<BondContext, 'burnBlockHeight'>) {
  if (position.status !== 'active') return false;
  const remaining = blocksUntil(position.unlockBurnHeight, ctx);
  return remaining > 0 && remaining <= endingSoonThresholdBlocks;
}

export function daysUntil(targetBurnHeight: number, ctx: Pick<BondContext, 'burnBlockHeight'>) {
  return Math.max(0, Math.ceil(blocksUntil(targetBurnHeight, ctx) / burnBlocksPerDay));
}

export function estimateDateAtBurnHeight(
  targetBurnHeight: number,
  ctx: Pick<BondContext, 'burnBlockHeight'>,
  nowMs = Date.now()
): Date {
  return new Date(nowMs + blocksUntil(targetBurnHeight, ctx) * secondsPerBurnBlock * 1000);
}

const shortDateFormatter = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' });

export function formatShortDate(date: Date) {
  return shortDateFormatter.format(date);
}

export function formatEstimatedDate(
  targetBurnHeight: number,
  ctx: Pick<BondContext, 'burnBlockHeight'>,
  nowMs?: number
) {
  return formatShortDate(estimateDateAtBurnHeight(targetBurnHeight, ctx, nowMs));
}

export function formatBurnHeight(height: number) {
  return new Intl.NumberFormat(undefined).format(height);
}

export function formatPeriodName(schedule: Pick<BondPeriodSchedule, 'bondIndex'>) {
  return `Period ${schedule.bondIndex}`;
}

export function hasActiveBond(ctx: BondContext | undefined): ctx is BondContext & {
  position: BondPosition;
} {
  return !!ctx?.position && ctx.position.status === 'active';
}
