import { ReactElement } from 'react';

import { css } from 'leather-styles/css';
import { Box, VStack, styled } from 'leather-styles/jsx';
import { InfoGrid } from '~/components/info-grid/info-grid';
import { PostLabelHoverCard } from '~/components/post-label-hover-card';
import { ValueDisplayer } from '~/components/value-displayer/default-value-displayer';
import { DASH } from '~/constants/constants';
import { StackingPool, getPostSlugForProvider } from '~/data/data';
import { LearnMoreLink } from '~/features/page/page';
import { TextElementTag } from '~/shared/types';
import { getPosts, usePost } from '~/utils/post-utils';
import { toHumanReadableMicroStx } from '~/utils/unit-convert';

interface RewardTokenCellProps {
  token?: string;
  value?: string;
}
function RewardTokenCell({ token, value }: RewardTokenCellProps): ReactElement {
  const posts = getPosts();
  const post = posts.stackingRewardsTokens;
  const label = post?.title ?? 'Rewards token';
  return (
    <ValueDisplayer
      name={<PostLabelHoverCard post={post} label={label} textStyle="label.03" />}
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
  const posts = getPosts();
  const post = posts.stackingMinimumLockupPeriod;
  const label = post?.title ?? 'Minimum lockup period';
  return (
    <ValueDisplayer
      name={<PostLabelHoverCard post={post} label={label} textStyle="label.03" />}
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
  const posts = getPosts();
  const post = posts.stackingUpcomingCycle;
  const label = post?.title ?? 'Days until next cycle';
  return (
    <ValueDisplayer
      name={<PostLabelHoverCard post={post} label={label} textStyle="label.03" />}
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
  const posts = getPosts();
  const post = posts.stackingMinimumCommitment;
  const label = post?.title ?? 'Minimum commitment';

  const displayValue =
    typeof minimumCommitment === 'number'
      ? toHumanReadableMicroStx(minimumCommitment)
      : minimumCommitment;

  return (
    <ValueDisplayer
      name={<PostLabelHoverCard post={post} label={label} textStyle="label.03" />}
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
  const posts = getPosts();
  const post = posts.historicalYield;
  const label = post?.title ?? 'Historical yield';
  return (
    <ValueDisplayer
      name={<PostLabelHoverCard post={post} label={label} textStyle="label.03" />}
      value={<>{historicalApr || DASH}</>}
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
  const posts = getPosts();
  const post = posts.totalLockedValueTvl;
  const label = post?.title ?? 'Total value locked';
  return (
    <ValueDisplayer
      name={<PostLabelHoverCard post={post} label={label} textStyle="label.03" />}
      value={
        <>
          {totalValueLocked || DASH}{' '}
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
function PoolCell({ pool, poolSlug }: PoolOverviewProps): ReactElement {
  const postSlug = getPostSlugForProvider(poolSlug) ?? '';
  const post = usePost(postSlug);
  return (
    <VStack gap="space.05" alignItems="left" p="space.05">
      {'icon' in pool ? (pool as any).icon : null}
      <styled.h4 textDecoration="underline" textStyle="label.01">
        {post?.title || ''}
      </styled.h4>
      {post && (
        <styled.div textStyle="caption.01">
          {post.sentence}
          <LearnMoreLink destination={post.slug} precedingText={post.sentence} />
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
  const formattedTvl = (pool as any).tvl || DASH;
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

// Add a component for the stacking-amount post label
export function StackingAmountLabel({
  textStyle = 'label.03',
  tagName = 'h1',
}: {
  textStyle?: string;
  tagName?: TextElementTag;
}): ReactElement {
  const posts = getPosts();
  const post = posts.stackingAmount;
  const label = post?.title ?? 'Amount';
  return <PostLabelHoverCard post={post} label={label} textStyle={textStyle} tagName={tagName} />;
}
