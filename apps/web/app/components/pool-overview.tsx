import { css } from 'leather-styles/css';
import { Box, VStack, styled } from 'leather-styles/jsx';
import { InfoGrid } from '~/components/info-grid/info-grid';
import { ValueDisplayer } from '~/components/value-displayer/default-value-displayer';
import { StackingPool } from '~/data/data';
import { PostLabelHoverCard } from '~/components/post-label-hover-card';
import { content } from '~/data/content';
import { PostValueHoverCard } from '~/components/post-value-hover-card';
import { getLearnMoreLink } from '~/features/page/page';
import { usePost } from '~/utils/post-utils';

import { ProviderIcon } from './icons/provider-icon';

interface RewardTokenCellProps {
  token?: string;
  value?: string;
  textStyle?: string;
}
function RewardTokenCell({ token = 'STX', value, textStyle }: RewardTokenCellProps) {
  return (
    <ValueDisplayer
      name={<PostLabelHoverCard postKey="stacking-rewards-tokens" label={(content.posts as Record<string, any>)["stacking-rewards-tokens"]?.Title || "Rewards token"} textStyle={textStyle} />}
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
  lockupPeriod?: string;
  textStyle?: string;
}
function LockupPeriodCell({ lockupPeriod = '1 Cycle', textStyle }: LockupPeriodCellProps) {
  return <ValueDisplayer name={<PostLabelHoverCard postKey="stacking-minimum-lockup-period" label={(content.posts as Record<string, any>)["stacking-minimum-lockup-period"]?.Title || "Minimum lockup period"} textStyle={textStyle} />} value={<>{lockupPeriod}</>} />;
}

interface DaysUntilNextCycleCellProps {
  daysUntilNextCycle?: string;
  textStyle?: string;
}
function DaysUntilNextCycleCell({ daysUntilNextCycle = '2 days', textStyle }: DaysUntilNextCycleCellProps) {
  return (
    <ValueDisplayer
      name={<PostLabelHoverCard postKey="stacking-upcoming-cycle" label={(content.posts as Record<string, any>)["stacking-upcoming-cycle"]?.Title || "Days until next cycle"} textStyle={textStyle} />}
      value={
        <>
          {daysUntilNextCycle} <Box textStyle="label.03">Cycle 104 - 254 blocks</Box>
        </>
      }
    />
  );
}

interface MinimumCommitmentCellProps {
  minimumCommitment?: string;
  textStyle?: string;
}
function MinimumCommitmentCell({
  minimumCommitment = '40,000,000.00 STX',
  textStyle,
}: MinimumCommitmentCellProps) {
  return <ValueDisplayer name={<PostLabelHoverCard postKey="stacking-minimum-commitment" label={(content.posts as Record<string, any>)["stacking-minimum-commitment"]?.Title || "Minimum commitment"} textStyle={textStyle} />} value={<>{minimumCommitment}</>} />;
}

interface HistoricalAprCellProps {
  historicalApr?: string;
  textStyle?: string;
}
function HistoricalAprCell({ historicalApr, textStyle }: HistoricalAprCellProps) {
  return <ValueDisplayer name={<PostLabelHoverCard postKey="historical-yield" label={(content.posts as Record<string, any>)["historical-yield"]?.Title || "Historical yield"} textStyle={textStyle} />} value={<>{historicalApr}</>} />;
}

interface TotalValueLockedCellProps {
  totalValueLocked?: string;
  totalValueLockedUsd?: string;
  textStyle?: string;
}
function TotalValueLockedCell({
  totalValueLocked = '51,784,293 STX',
  totalValueLockedUsd = '$36,212,756',
  textStyle,
}: TotalValueLockedCellProps) {
  return (
    <ValueDisplayer
      name={<PostLabelHoverCard postKey="total-locked-value-tvl" label={(content.posts as Record<string, any>)["total-locked-value-tvl"]?.Title || "Total value locked"} textStyle={textStyle} />}
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
  textStyle?: string;
}
function getPostSlugForPool(poolSlug: string): string | undefined {
  switch (poolSlug) {
    case 'fast-pool':
    case 'fast-pool-v2':
      return 'fast-pool';
    case 'plan-better':
      return 'planbetter';
    case 'restake':
      return 'restake';
    case 'xverse-pool':
      return 'xverse-pool';
    case 'stacking-dao':
      return 'stacking-dao';
    default:
      return undefined;
  }
}
function PoolCell({ pool, poolSlug }: PoolOverviewProps) {
  const postSlug = getPostSlugForPool(poolSlug);
  const post = usePost(postSlug || '');
  return (
    <VStack gap="space.05" alignItems="left" p="space.05">
      <ProviderIcon providerId={pool.providerId} />
      <styled.h4 textStyle="label.01">{pool.name}</styled.h4>
      {post && (
        <styled.p textStyle="caption.01">
          {post.Sentence}
          {getLearnMoreLink(post.Slug, post.Sentence)}
        </styled.p>
      )}
    </VStack>
  );
}

export function PoolOverview({ pool, poolSlug, textStyle = "label.03" }: PoolOverviewProps) {
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
        <PoolCell pool={pool} poolSlug={poolSlug} textStyle={textStyle} />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['1', '1', '2']} gridRow={['2', '2', '1']}>
        <HistoricalAprCell textStyle={textStyle} />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['2', '2', '2']} gridRow={['2', '2', '2']}>
        <LockupPeriodCell textStyle={textStyle} />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['1', '1', '3']} gridRow={['3', '3', '1']}>
        <TotalValueLockedCell textStyle={textStyle} />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['2', '2', '3']} gridRow={['3', '3', '2']}>
        <DaysUntilNextCycleCell textStyle={textStyle} />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['1', '1', '4']} gridRow={['4', '4', '1']}>
        <RewardTokenCell textStyle={textStyle} />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['2', '2', '4']} gridRow={['4', '4', '2']}>
        <MinimumCommitmentCell textStyle={textStyle} />
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
