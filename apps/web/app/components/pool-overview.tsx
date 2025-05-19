import { css } from 'leather-styles/css';
import { Box, VStack, styled } from 'leather-styles/jsx';
import { InfoGrid } from '~/components/info-grid/info-grid';
import { ValueDisplayer } from '~/components/value-displayer/default-value-displayer';
import { PoolRewardProtocolInfo } from '~/features/stacking/start-pooled-stacking/components/preset-pools';
import { PostLabelHoverCard } from '~/components/post-label-hover-card';
import { content } from '~/data/content';
import { PostValueHoverCard } from '~/components/post-value-hover-card';
import { getLearnMoreLink } from '~/features/page/page';
import { usePost } from '~/utils/post-hooks';
import { daysToWeek, toHumanReadableDays, toHumanReadableWeeks } from '~/utils/unit-convert';
import { ProviderIcon } from '~/components/icons/provider-icon';
import type { StackingPool } from '~/data/data';

interface RewardTokenCellProps {
  token?: string;
  value?: string;
  textStyle?: string;
}
function RewardTokenCell({ token = 'STX', value, textStyle }: RewardTokenCellProps) {
  return (
    <ValueDisplayer
      name={<PostLabelHoverCard postKey="stacking-rewards-tokens" label={(content.posts as Record<string, any>)["stacking-rewards-tokens"]?.Title || "Rewards token"} textStyle="label.03" />}
      value={
        <>
          {token}
          <Box textStyle="label.03">{value}</Box>
        </>
      }
    />
  );
}

interface LockupPeriodCellProps {
  minLockupPeriodDays: number;
}
function LockupPeriodCell({ minLockupPeriodDays }: LockupPeriodCellProps) {
  return <ValueDisplayer name="Minimum lockup period" value={<>{minLockupPeriodDays} Cycle(s)</>} />;
}

interface DaysUntilNextCycleCellProps {
  daysUntilNextCycle: number;
  nextCycleNumber: number;
  nextCycleBlocks: number;
}
function DaysUntilNextCycleCell({ daysUntilNextCycle, nextCycleNumber, nextCycleBlocks }: DaysUntilNextCycleCellProps) {
  return (
    <ValueDisplayer
      name={<PostLabelHoverCard postKey="stacking-upcoming-cycle" label={(content.posts as Record<string, any>)["stacking-upcoming-cycle"]?.Title || "Days until next cycle"} textStyle="label.03" />}
      value={
        <>
          {daysUntilNextCycle} days (Cycle {nextCycleNumber}, {nextCycleBlocks} blocks)
        </>
      }
    />
  );
}

interface MinimumCommitmentCellProps {
  minimumCommitment?: string;
}
function MinimumCommitmentCell({
  minimumCommitment = '40,000,000.00 STX',
}: MinimumCommitmentCellProps) {
  return <ValueDisplayer name="Minimum commitment" value={<>{minimumCommitment}</>} />;
}

interface HistoricalAprCellProps {
  historicalApr?: string;
}
function HistoricalAprCell({ historicalApr }: HistoricalAprCellProps) {
  return <ValueDisplayer name={<PostLabelHoverCard postKey="historical-yield" label={(content.posts as Record<string, any>)["historical-yield"]?.Title || "Historical APR"} textStyle="label.03" />} value={<>{historicalApr}</>} />;
}

interface TotalValueLockedCellProps {
  totalValueLocked?: string;
  totalValueLockedUsd?: string;
}
function TotalValueLockedCell({
  totalValueLocked = '51,784,293 STX',
  totalValueLockedUsd = '$36,212,756',
}: TotalValueLockedCellProps) {
  return (
    <ValueDisplayer
      name={<PostLabelHoverCard postKey="total-locked-value-tvl" label={(content.posts as Record<string, any>)["total-locked-value-tvl"]?.Title || "Total value locked"} textStyle="label.03" />}
      value={
        <>
          {totalValueLocked} <Box textStyle="label.03">{totalValueLockedUsd}</Box>
        </>
      }
    />
  );
}

interface PoolOverviewProps {
  pool: StackingPool;
  poolSlug: string;
}
function PoolCell({ pool }: PoolOverviewProps) {
  return (
    <VStack gap="space.05" alignItems="left" p="space.05">
      <ProviderIcon providerId={pool.providerId} />
      <styled.h4 textDecoration="underline" textStyle="label.01">
        {pool.name || pool.title}
      </styled.h4>
      <styled.p textStyle="caption.01">{pool.description}</styled.p>
    </VStack>
  );
}

export function PoolOverview({ pool, poolSlug }: PoolOverviewProps) {
  // Demo/default values for required props
  const minLockupPeriodDays = 1;
  const daysUntilNextCycle = 2;
  const nextCycleNumber = 10;
  const nextCycleBlocks = 100;
  return (
    <InfoGrid
      width="100%"
      gridTemplateColumns={['repeat(2, 1fr)', 'repeat(2, 1fr)', 'repeat(4, 1fr)']}
      gridTemplateRows={['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto']}
      height="fit-content"
      className={css({ '& > *:not(:first-child)': { height: ['120px', null, 'unset'] } })}
      borderTop="0px"
      borderLeft="0px"
      borderRight="0px"
      borderRadius="0px"
    >
      <InfoGrid.Cell gridColumn={['span 2', 'span 2', 'auto']} gridRow={['1', '1', 'span 2']}>
        <PoolCell pool={pool} poolSlug={poolSlug} />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['1', '1', '2']} gridRow={['2', '2', '1']}>
        <HistoricalAprCell historicalApr={pool.apr} />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['2', '2', '2']} gridRow={['2', '2', '2']}>
        <LockupPeriodCell minLockupPeriodDays={minLockupPeriodDays} />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['1', '1', '3']} gridRow={['3', '3', '1']}>
        <TotalValueLockedCell />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['2', '2', '3']} gridRow={['3', '3', '2']}>
        <DaysUntilNextCycleCell daysUntilNextCycle={daysUntilNextCycle} nextCycleNumber={nextCycleNumber} nextCycleBlocks={nextCycleBlocks} />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['1', '1', '4']} gridRow={['4', '4', '1']}>
        <RewardTokenCell textStyle="label.03" />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['2', '2', '4']} gridRow={['4', '4', '2']}>
        <MinimumCommitmentCell />
      </InfoGrid.Cell>
    </InfoGrid>
  );
}

// Add a component for the stacking-amount post label
export function StackingAmountLabel({ textStyle = "label.03", tagName = "h1" }: { textStyle?: string; tagName?: keyof JSX.IntrinsicElements }) {
  const label = (content.posts as Record<string, any>)["stacking-amount"]?.Title || "Amount";
  return (
    <PostLabelHoverCard
      postKey="stacking-amount"
      label={label}
      textStyle={textStyle}
      tagName={tagName}
    />
  );
}

// Add a component for the stacking-rewards-address post label
export function StackingRewardsAddressLabel({ textStyle = "label.01", tagName = "h1" }: { textStyle?: string; tagName?: 'h1' | 'h2' | 'h3' | 'h4' | 'span' }) {
  const label = (content.posts as Record<string, any>)["stacking-rewards-address"]?.Title || "Rewards address";
  return (
    <PostLabelHoverCard
      postKey="stacking-rewards-address"
      label={label}
      textStyle={textStyle}
      tagName={tagName}
    />
  );
}

// Add a component for the stacking-duration post label
export function StackingDurationLabel({ textStyle = "label.01", tagName = "h1" }: { textStyle?: string; tagName?: 'h1' | 'h2' | 'h3' | 'h4' | 'span' }) {
  const label = (content.posts as Record<string, any>)["stacking-duration"]?.Title || "Duration";
  return (
    <PostLabelHoverCard
      postKey="stacking-duration"
      label={label}
      textStyle={textStyle}
      tagName={tagName}
    />
  );
}

// Add a component for the stacking-contract-details post label
export function StackingContractDetailsLabel({ textStyle = "label.01", tagName = "h1" }: { textStyle?: string; tagName?: 'h1' | 'h2' | 'h3' | 'h4' | 'span' }) {
  const label = (content.posts as Record<string, any>)["stacking-contract-details"]?.Title || "Details";
  return (
    <PostLabelHoverCard
      postKey="stacking-contract-details"
      label={label}
      textStyle={textStyle}
      tagName={tagName}
    />
  );
}

// Add a component for the pooled-stacking-conditions post label
export function PooledStackingConditionsLabel({ textStyle = "label.01", tagName = "h1" }: { textStyle?: string; tagName?: 'h1' | 'h2' | 'h3' | 'h4' | 'span' }) {
  const label = (content.posts as Record<string, any>)["pooled-stacking-conditions"]?.Title || "Pooling conditions";
  return (
    <PostLabelHoverCard
      postKey="pooled-stacking-conditions"
      label={label}
      textStyle={textStyle}
      tagName={tagName}
    />
  );
}
