import type { ReactNode } from 'react';

import { BondsSelectors } from '@tests/selectors/bonds.selectors';
import { Flex, Stack, styled } from 'leather-styles/jsx';

import type { Money } from '@leather.io/models';
import { Badge, ChevronDownIcon } from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';

import type { BondContext, BondPeriodSchedule, BondPosition } from '../bond-position.model';
import {
  bondLockedBtc,
  bondLockedStx,
  bondPaidOutBtc,
  daysUntil,
  formatBurnHeight,
  formatEstimatedDate,
  formatPeriodName,
  isEndingSoon,
} from '../bond-position.utils';

interface DetailRowProps {
  label: string;
  value: ReactNode;
  valueColor?: string;
}

function DetailRow({ label, value, valueColor = 'ink.text-primary' }: DetailRowProps) {
  return (
    <Flex justifyContent="space-between" alignItems="center" gap="space.03" minHeight="20px">
      <styled.span textStyle="caption.01" color="ink.text-subdued" flexShrink={0}>
        {label}
      </styled.span>
      <styled.span textStyle="caption.01" color={valueColor} textAlign="right">
        {value}
      </styled.span>
    </Flex>
  );
}

interface CardHeaderProps {
  title: string;
  badge: ReactNode;
  trailing?: ReactNode;
}

function CardHeader({ title, badge, trailing }: CardHeaderProps) {
  return (
    <Flex justifyContent="space-between" alignItems="center" gap="space.02">
      <styled.span textStyle="label.01">{title}</styled.span>
      <Flex alignItems="center" gap="space.02">
        {badge}
        {trailing}
      </Flex>
    </Flex>
  );
}

function periodBadge(position: BondPosition, ctx: BondContext) {
  if (position.status === 'unlocked') return <Badge label="Unlocked" variant="default" />;
  if (position.status === 'upcoming') return <Badge label="Starts soon" variant="info" />;
  if (isEndingSoon(position, ctx)) {
    const days = daysUntil(position.unlockBurnHeight, ctx);
    return <Badge label={`Ends in ${days} ${days === 1 ? 'day' : 'days'}`} variant="warning" />;
  }
  return <Badge label="Active" variant="success" />;
}

interface BondPeriodCardProps {
  position: BondPosition;
  ctx: BondContext;
}

export function BondPeriodCard({ position, ctx }: BondPeriodCardProps) {
  return (
    <Stack gap="space.04" py="space.05" data-testid={BondsSelectors.BondPeriodCard}>
      <CardHeader title={formatPeriodName(position)} badge={periodBadge(position, ctx)} />
      <Stack gap="space.03">
        <DetailRow
          label="Amount"
          value={formatCurrency(bondLockedBtc(position), { preset: 'pad-decimals' })}
        />
        <DetailRow label="STX stacked" value={formatCurrency(bondLockedStx(position))} />
        <DetailRow
          label="Policy"
          value={
            <styled.span fontFamily="mono">{truncateMiddle(position.policyAddress, 4)}</styled.span>
          }
        />
        <DetailRow
          label={position.status === 'unlocked' ? 'Unlocked' : 'Unlocks'}
          value={`about ${formatEstimatedDate(position.unlockBurnHeight, ctx)} · block ${formatBurnHeight(position.unlockBurnHeight)}`}
        />
        <DetailRow label="Held by" value="Your key, timelock script" />
        <DetailRow
          label="Paid out"
          value={`+${formatCurrency(bondPaidOutBtc(position))}`}
          valueColor="green.action-primary-default"
        />
      </Stack>
    </Stack>
  );
}

interface RenewalCardProps {
  renewal: BondPeriodSchedule;
  amount: Money;
  ctx: BondContext;
}

export function RenewalCard({ renewal, amount, ctx }: RenewalCardProps) {
  return (
    <Flex
      justifyContent="space-between"
      alignItems="center"
      gap="space.03"
      py="space.05"
      data-testid={BondsSelectors.BondRenewalCard}
    >
      <Stack gap="space.01">
        <Flex alignItems="center" gap="space.02">
          <styled.span textStyle="label.01">{formatPeriodName(renewal)}</styled.span>
          <Badge label="Renewal set" variant="info" />
        </Flex>
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          Starts {formatEstimatedDate(renewal.startBurnHeight, ctx)}
        </styled.span>
      </Stack>
      <Flex alignItems="center" gap="space.02">
        <Stack gap="space.01" alignItems="flex-end">
          <styled.span textStyle="label.02">
            {formatCurrency(amount, { preset: 'pad-decimals' })}
          </styled.span>
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            rolls over
          </styled.span>
        </Stack>
        <ChevronDownIcon color="ink.text-subdued" variant="small" />
      </Flex>
    </Flex>
  );
}

interface NextPeriodCardProps {
  nextPeriod: NonNullable<BondPosition['nextPeriod']>;
  ctx: BondContext;
}

export function NextPeriodCard({ nextPeriod, ctx }: NextPeriodCardProps) {
  const opens = formatEstimatedDate(nextPeriod.registrationOpensBurnHeight, ctx);
  const closes = formatEstimatedDate(nextPeriod.registrationClosesBurnHeight, ctx);
  const isOpen = ctx.burnBlockHeight >= nextPeriod.registrationOpensBurnHeight;

  return (
    <Stack gap="space.04" py="space.05" data-testid={BondsSelectors.BondNextPeriodCard}>
      <CardHeader
        title={formatPeriodName(nextPeriod)}
        badge={
          <Badge
            label={isOpen ? `Open until ${closes}` : `Opens ${opens}`}
            variant={isOpen ? 'success' : 'default'}
          />
        }
      />
      <Stack gap="space.03">
        <DetailRow label="Window" value={`${opens} to ${closes}`} />
        <DetailRow label="Your bonds" value="None yet" valueColor="ink.text-subdued" />
      </Stack>
    </Stack>
  );
}
