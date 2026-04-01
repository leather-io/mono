import { ReactElement } from 'react';

import { css } from 'leather-styles/css';
import { Box, VStack, styled } from 'leather-styles/jsx';
import { InfoGrid } from '~/components/info-grid/info-grid';
import { LearnHoverCard } from '~/components/learn-hover-card';
import { ValueDisplayer } from '~/components/value-displayer/default-value-displayer';
import { EM_DASH } from '~/constants/constants';
import { learnArticles } from '~/content/learn-content';
import { StackingPool } from '~/data/data';
import { LearnMoreLink } from '~/layouts/page/page';
import { toHumanReadableMicroStx } from '~/utils/unit-convert';

interface RewardTokenCellProps {
  token?: string;
  value?: string;
}
function RewardTokenCell({ token, value }: RewardTokenCellProps): ReactElement {
  const article = learnArticles.stackingRewardsTokens;
  const label = article?.title ?? 'Rewards token';
  return (
    <ValueDisplayer
      name={<LearnHoverCard article={article} label={label} textStyle="label.03" />}
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
function LockupPeriodCell({ minLockupPeriodDays }: LockupPeriodCellProps): ReactElement {
  const article = learnArticles.stackingMinimumLockupPeriod;
  const label = article?.title ?? 'Minimum lockup period';
  return (
    <ValueDisplayer
      name={<LearnHoverCard article={article} label={label} textStyle="label.03" />}
      value={<>{minLockupPeriodDays} days</>}
    />
  );
}

interface DaysUntilNextCycleCellProps {
  daysUntilNextCycle: number;
  nextCycleNumber: number;
  nextCycleBlocks: number;
}
function DaysUntilNextCycleCell({
  daysUntilNextCycle,
  nextCycleNumber,
  nextCycleBlocks,
}: DaysUntilNextCycleCellProps): ReactElement {
  const article = learnArticles.stackingUpcomingCycle;
  const label = article?.title ?? 'Days until next cycle';
  return (
    <ValueDisplayer
      name={<LearnHoverCard article={article} label={label} textStyle="label.03" />}
      value={
        <>
          {daysUntilNextCycle} days
          <Box textStyle="label.03">
            (Cycle {nextCycleNumber}, {nextCycleBlocks} blocks)
          </Box>
        </>
      }
    />
  );
}

interface MinimumCommitmentCellProps {
  minimumCommitment?: string | number;
  minimumCommitmentUsd?: string;
}
function MinimumCommitmentCell({
  minimumCommitment,
  minimumCommitmentUsd,
}: MinimumCommitmentCellProps): ReactElement {
  const article = learnArticles.stackingMinimumCommitment;
  const label = article?.title ?? 'Minimum commitment';

  const displayValue =
    typeof minimumCommitment === 'number'
      ? toHumanReadableMicroStx(minimumCommitment)
      : minimumCommitment;

  return (
    <ValueDisplayer
      name={<LearnHoverCard article={article} label={label} textStyle="label.03" />}
      value={
        <>
          {displayValue}{' '}
          {minimumCommitmentUsd && <Box textStyle="label.03">{minimumCommitmentUsd}</Box>}
        </>
      }
    />
  );
}

interface HistoricalAprCellProps {
  historicalApr?: string | null;
}
function HistoricalAprCell({ historicalApr }: HistoricalAprCellProps): ReactElement {
  const article = learnArticles.historicalYield;
  const label = article?.title ?? 'Historical yield';
  return (
    <ValueDisplayer
      name={<LearnHoverCard article={article} label={label} textStyle="label.03" />}
      value={<>{historicalApr || EM_DASH}</>}
    />
  );
}

interface TotalValueLockedCellProps {
  totalValueLocked?: string | null;
  totalValueLockedUsd?: string | null;
}
function TotalValueLockedCell({
  totalValueLocked,
  totalValueLockedUsd,
}: TotalValueLockedCellProps): ReactElement {
  const article = learnArticles.totalLockedValueTvl;
  const label = article?.title ?? 'Total value locked';
  return (
    <ValueDisplayer
      name={<LearnHoverCard article={article} label={label} textStyle="label.03" />}
      value={
        <>
          {totalValueLocked || EM_DASH}{' '}
          {totalValueLockedUsd && <Box textStyle="label.03">{totalValueLockedUsd}</Box>}
        </>
      }
    />
  );
}

interface PoolOverviewProps {
  pool: StackingPool;
  poolSlug: string;
}
function PoolCell({ pool }: PoolOverviewProps): ReactElement {
  return (
    <VStack gap="space.05" alignItems="left" p="space.05">
      {'icon' in pool ? (pool as any).icon : null}
      <styled.h4 textDecoration="underline" textStyle="label.01">
        {pool.name}
      </styled.h4>
      {pool.description && (
        <styled.div textStyle="caption.01">
          {pool.description}
          {pool.website && <LearnMoreLink destination={pool.website} />}
        </styled.div>
      )}
    </VStack>
  );
}

export function PoolOverview({ pool, poolSlug }: PoolOverviewProps): ReactElement {
  // Get values from pool object and round to whole numbers
  const minLockupPeriodDays = Math.round((pool as any).minLockupPeriodDays || pool.duration);
  const daysUntilNextCycle = Math.round((pool as any).nextCycleDays);
  const nextCycleNumber = (pool as any).nextCycleNumber;
  const nextCycleBlocks = (pool as any).nextCycleBlocks;

  // minimumDelegationAmount is always in microSTX (1 STX = 1,000,000 microSTX)
  const displayMinCommitment =
    typeof pool.minimumDelegationAmount === 'number'
      ? toHumanReadableMicroStx(pool.minimumDelegationAmount)
      : '';

  // Format TVL values without special cases
  const formattedTvl = (pool as any).tvl || EM_DASH;
  const formattedTvlUsd = (pool as any).tvlUsd;

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
        <HistoricalAprCell historicalApr={String((pool as any).estApr || '')} />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['2', '2', '2']} gridRow={['2', '2', '2']}>
        <LockupPeriodCell minLockupPeriodDays={minLockupPeriodDays} />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['1', '1', '3']} gridRow={['3', '3', '1']}>
        <TotalValueLockedCell
          totalValueLocked={formattedTvl}
          totalValueLockedUsd={formattedTvlUsd}
        />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['2', '2', '3']} gridRow={['3', '3', '2']}>
        <DaysUntilNextCycleCell
          daysUntilNextCycle={daysUntilNextCycle}
          nextCycleNumber={nextCycleNumber}
          nextCycleBlocks={nextCycleBlocks}
        />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['1', '1', '4']} gridRow={['4', '4', '1']}>
        <RewardTokenCell token={pool.payout} />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['2', '2', '4']} gridRow={['4', '4', '2']}>
        <MinimumCommitmentCell
          minimumCommitment={displayMinCommitment}
          minimumCommitmentUsd={(pool as any).minCommitmentUsd}
        />
      </InfoGrid.Cell>
    </InfoGrid>
  );
}
