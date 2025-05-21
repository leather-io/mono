import { ReactElement } from 'react';

import { css } from 'leather-styles/css';
import { Box, HTMLStyledProps, VStack, styled } from 'leather-styles/jsx';
import { InfoGrid } from '~/components/info-grid/info-grid';
import { PostLabelHoverCard } from '~/components/post-label-hover-card';
import { ValueDisplayer } from '~/components/value-displayer/default-value-displayer';
import { StackingPool, getPostSlugForProvider } from '~/data/data';
import { getLearnMoreLink } from '~/features/page/page';
import { TextElementTag } from '~/shared/types';
import { getPosts, usePost } from '~/utils/post-utils';

interface RewardTokenCellProps {
  token: string;
  value?: string;
  textStyle?: string;
}
function RewardTokenCell({
  token,
  value,
  textStyle = 'label.03',
}: RewardTokenCellProps): ReactElement {
  const posts = getPosts();
  const post = posts.stackingRewardsTokens;
  const label = post?.title ?? 'Rewards token';
  return (
    <ValueDisplayer
      name={<PostLabelHoverCard post={post} label={label} textStyle={textStyle} />}
      value={
        <>
          {token}
          <Box textStyle={textStyle}>{value}</Box>
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
      value={<>{minLockupPeriodDays} cycle(s)</>}
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
}: DaysUntilNextCycleCellProps) {
  const posts = getPosts();
  const post = posts.stackingUpcomingCycle;
  const label = post?.title ?? 'Days until next cycle';
  return (
    <ValueDisplayer
      name={<PostLabelHoverCard post={post} label={label} textStyle="label.03" />}
      value={`${daysUntilNextCycle} days (Cycle ${nextCycleNumber}, ${nextCycleBlocks} blocks)`}
    />
  );
}

interface MinimumCommitmentCellProps {
  minimumCommitment: string;
}
function MinimumCommitmentCell({ minimumCommitment }: MinimumCommitmentCellProps) {
  const posts = getPosts();
  const post = posts.stackingMinimumCommitment;
  const label = post?.title ?? 'Minimum commitment';
  return (
    <ValueDisplayer
      name={<PostLabelHoverCard post={post} label={label} textStyle="label.03" />}
      value={minimumCommitment}
    />
  );
}

interface HistoricalAprCellProps {
  historicalApr: string;
}
function HistoricalAprCell({ historicalApr }: HistoricalAprCellProps) {
  const posts = getPosts();
  const post = posts.historicalYield;
  const label = post?.title ?? 'Historical yield';
  return (
    <ValueDisplayer
      name={<PostLabelHoverCard post={post} label={label} textStyle="label.03" />}
      value={<>{historicalApr}</>}
    />
  );
}

interface TotalValueLockedCellProps {
  totalValueLocked: string;
  totalValueLockedUsd: string;
}
function TotalValueLockedCell({
  totalValueLocked,
  totalValueLockedUsd,
}: TotalValueLockedCellProps) {
  const posts = getPosts();
  const post = posts.totalLockedValueTvl;
  const label = post?.title ?? 'Total value locked';
  return (
    <ValueDisplayer
      name={<PostLabelHoverCard post={post} label={label} textStyle="label.03" />}
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
function PoolCell({ pool, poolSlug }: PoolOverviewProps) {
  const postSlug = getPostSlugForProvider(poolSlug) ?? '';
  const post = usePost(postSlug);
  return (
    <VStack gap="space.05" alignItems="left" p="space.05">
      {'logo' in pool ? (pool as any).logo : null}
      <styled.h4 textDecoration="underline" textStyle="label.01">
        {'title' in pool ? (pool as any).title : ''}
      </styled.h4>
      {post && (
        <styled.p textStyle="caption.01">
          {post.sentence}
          {getLearnMoreLink(post.slug, post.sentence)}
        </styled.p>
      )}
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
        <HistoricalAprCell historicalApr={pool.estApr} />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['2', '2', '2']} gridRow={['2', '2', '2']}>
        <LockupPeriodCell minLockupPeriodDays={minLockupPeriodDays} />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['1', '1', '3']} gridRow={['3', '3', '1']}>
        <TotalValueLockedCell
          totalValueLocked={`${pool.tvlUsd.replace('$', '')} STX`}
          totalValueLockedUsd={pool.tvlUsd}
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
        <RewardTokenCell token={pool.rewardsToken} textStyle="label.03" />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['2', '2', '4']} gridRow={['4', '4', '2']}>
        <MinimumCommitmentCell minimumCommitment={pool.minAmount || '0 STX'} />
      </InfoGrid.Cell>
    </InfoGrid>
  );
}

// Add a component for the stacking-amount post label
export function StackingAmountLabel({
  textStyle = 'label.03',
  tagName = 'h1',
  ...props
}: {
  textStyle?: string;
  tagName?: TextElementTag;
} & HTMLStyledProps<'span'>) {
  const posts = getPosts();
  const post = posts.stackingAmount;
  const label = post?.title ?? 'Amount';
  return (
    <PostLabelHoverCard
      post={post}
      label={label}
      textStyle={textStyle}
      tagName={tagName}
      {...props}
    />
  );
}

// Add a component for the stacking-rewards-address post label
export function StackingRewardsAddressLabel({
  textStyle = 'label.01',
  tagName = 'h1',
  ...props
}: {
  textStyle?: string;
  tagName?: TextElementTag;
} & HTMLStyledProps<'span'>) {
  const posts = getPosts();
  const post = posts.stackingRewardsAddress;
  const label = post?.title ?? 'Rewards address';
  return (
    <PostLabelHoverCard
      post={post}
      label={label}
      textStyle={textStyle}
      tagName={tagName}
      {...props}
    />
  );
}

// Add a component for the stacking-duration post label
export function StackingDurationLabel({
  textStyle = 'label.01',
  tagName = 'h1',
  ...props
}: {
  textStyle?: string;
  tagName?: TextElementTag;
} & HTMLStyledProps<'span'>) {
  const posts = getPosts();
  const post = posts.stackingDuration;
  const label = post?.title ?? 'Duration';
  return (
    <PostLabelHoverCard
      post={post}
      label={label}
      textStyle={textStyle}
      tagName={tagName}
      {...props}
    />
  );
}

// Add a component for the stacking-contract-details post label
export function StackingContractDetailsLabel({
  textStyle = 'label.01',
  tagName = 'h1',
  ...props
}: {
  textStyle?: string;
  tagName?: TextElementTag;
} & HTMLStyledProps<'span'>) {
  const posts = getPosts();
  const post = posts.stackingContractDetails;
  const label = post?.title ?? 'Details';
  return (
    <PostLabelHoverCard
      post={post}
      label={label}
      textStyle={textStyle}
      tagName={tagName}
      {...props}
    />
  );
}

// Add a component for the pooled-stacking-conditions post label
export function PooledStackingConditionsLabel({
  textStyle = 'label.01',
  tagName = 'h1',
  ...props
}: {
  textStyle?: string;
  tagName?: TextElementTag;
} & HTMLStyledProps<'span'>) {
  const posts = getPosts();
  const post = posts.pooledStackingConditions;
  const label = post?.title ?? 'Pooling conditions';
  return (
    <PostLabelHoverCard
      post={post}
      label={label}
      textStyle={textStyle}
      tagName={tagName}
      {...props}
    />
  );
}
