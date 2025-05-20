import { css } from 'leather-styles/css';
import { Box, VStack, styled } from 'leather-styles/jsx';
import { InfoGrid } from '~/components/info-grid/info-grid';
import { ValueDisplayer } from '~/components/value-displayer/default-value-displayer';
import { PoolRewardProtocolInfo } from '~/features/stacking/start-pooled-stacking/components/preset-pools';
import { PostLabelHoverCard } from '~/components/post-label-hover-card';
import { content } from '~/data/content';
import { PostValueHoverCard } from '~/components/post-value-hover-card';
import { getLearnMoreLink } from '~/features/page/page';
import { usePost } from '~/utils/post-utils';
import { ProviderIcon } from './icons/provider-icon';
import type { StackingPool } from '~/data/data';
import { getPostSlugForProvider } from '~/data/data';
import type { PostsCollection } from '~/data/post-types';

interface RewardTokenCellProps {
  token?: string;
  value?: string;
  textStyle?: string;
}
function RewardTokenCell({ token = 'STX', value, textStyle = 'label.03' }: RewardTokenCellProps) {
  const posts = content.posts as unknown as PostsCollection;
  const label = posts['stacking-rewards-tokens']?.title ?? 'Rewards token';
  return (
    <ValueDisplayer
      name={<PostLabelHoverCard postKey="stacking-rewards-tokens" label={label} textStyle={textStyle} />}
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
function LockupPeriodCell({ minLockupPeriodDays }: LockupPeriodCellProps) {
  const posts = content.posts as unknown as PostsCollection;
  const label = posts['stacking-minimum-lockup-period']?.title ?? 'Minimum lockup period';
  return (
    <ValueDisplayer
      name={<PostLabelHoverCard postKey="stacking-minimum-lockup-period" label={label} textStyle="label.03" />}
      value={<>{minLockupPeriodDays} cycle(s)</>}
    />
  );
}

interface DaysUntilNextCycleCellProps {
  daysUntilNextCycle: number;
  nextCycleNumber: number;
  nextCycleBlocks: number;
}
function DaysUntilNextCycleCell({ daysUntilNextCycle, nextCycleNumber, nextCycleBlocks }: DaysUntilNextCycleCellProps) {
  const posts = content.posts as unknown as PostsCollection;
  const label = posts['stacking-upcoming-cycle']?.title ?? 'Days until next cycle';
  return (
    <ValueDisplayer
      name={<PostLabelHoverCard postKey="stacking-upcoming-cycle" label={label} textStyle="label.03" />}
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
  const posts = content.posts as unknown as PostsCollection;
  const label = posts['stacking-minimum-commitment']?.title ?? 'Minimum commitment';
  return (
    <ValueDisplayer
      name={<PostLabelHoverCard postKey="stacking-minimum-commitment" label={label} textStyle="label.03" />}
      value={<>{minimumCommitment}</>}
    />
  );
}

interface HistoricalAprCellProps {
  historicalApr?: string;
  textStyle?: string;
}
function HistoricalAprCell({ historicalApr, textStyle }: HistoricalAprCellProps) {
  const posts = content.posts as unknown as PostsCollection;
  const label = posts['historical-yield']?.title ?? 'Historical yield';
  return <ValueDisplayer name={<PostLabelHoverCard postKey="historical-yield" label={label} textStyle="label.03" />} value={<>{historicalApr}</>} />;
}

interface TotalValueLockedCellProps {
  totalValueLocked?: string;
  totalValueLockedUsd?: string;
}
function TotalValueLockedCell({
  totalValueLocked = '51,784,293 STX',
  totalValueLockedUsd = '$36,212,756',
}: TotalValueLockedCellProps) {
  const posts = content.posts as unknown as PostsCollection;
  const label = posts['total-locked-value-tvl']?.title ?? 'Total value locked';
  return (
    <ValueDisplayer
      name={<PostLabelHoverCard postKey="total-locked-value-tvl" label={label} textStyle="label.03" />}
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
export function StackingAmountLabel({ textStyle = "label.03", tagName = "h1" }: { textStyle?: string; tagName?: keyof React.JSX.IntrinsicElements }) {
  const posts = content.posts as unknown as PostsCollection;
  const label = posts['stacking-amount']?.title ?? 'Amount';
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
export function StackingRewardsAddressLabel({ textStyle = "label.01", tagName = "h1" }: { textStyle?: string; tagName?: keyof React.JSX.IntrinsicElements }) {
  const posts = content.posts as unknown as PostsCollection;
  const label = posts['stacking-rewards-address']?.title ?? 'Rewards address';
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
export function StackingDurationLabel({ textStyle = "label.01", tagName = "h1" }: { textStyle?: string; tagName?: keyof React.JSX.IntrinsicElements }) {
  const posts = content.posts as unknown as PostsCollection;
  const label = posts['stacking-duration']?.title ?? 'Duration';
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
export function StackingContractDetailsLabel({ textStyle = "label.01", tagName = "h1" }: { textStyle?: string; tagName?: keyof React.JSX.IntrinsicElements }) {
  const posts = content.posts as unknown as PostsCollection;
  const label = posts['stacking-contract-details']?.title ?? 'Details';
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
export function PooledStackingConditionsLabel({ textStyle = "label.01", tagName = "h1" }: { textStyle?: string; tagName?: keyof React.JSX.IntrinsicElements }) {
  const posts = content.posts as unknown as PostsCollection;
  const label = posts['pooled-stacking-conditions']?.title ?? 'Pooling conditions';
  return (
    <PostLabelHoverCard
      postKey="pooled-stacking-conditions"
      label={label}
      textStyle={textStyle}
      tagName={tagName}
    />
  );
}
