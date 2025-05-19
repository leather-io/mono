import { css } from 'leather-styles/css';
import { Box, VStack, styled } from 'leather-styles/jsx';
import { InfoGrid } from '~/components/info-grid/info-grid';
import { ValueDisplayer } from '~/components/value-displayer/default-value-displayer';
import { Protocol } from '~/features/stacking/start-liquid-stacking/utils/types-preset-protocols';
import { getLearnMoreLink } from '~/features/page/page';
import { usePost } from '~/utils/post-utils';
import { PostLabelHoverCard } from '~/components/post-label-hover-card';

interface RewardTokenCellProps {
  token?: string;
  value?: string;
}
function RewardTokenCell({ token = 'STX', value = '$36,212,756' }: RewardTokenCellProps) {
  return (
    <ValueDisplayer
      name="Rewards token"
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
}
function LockupPeriodCell({ lockupPeriod = '1 Cycle' }: LockupPeriodCellProps) {
  return <ValueDisplayer name="Minimum lockup period" value={lockupPeriod} />;
}

interface DaysUntilNextCycleCellProps {
  daysUntilNextCycle?: string;
}
function DaysUntilNextCycleCell({ daysUntilNextCycle = '2 days' }: DaysUntilNextCycleCellProps) {
  return (
    <ValueDisplayer
      name="Days until next cycle"
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
}
function MinimumCommitmentCell({
  minimumCommitment = '40,000,000.00 STX',
}: MinimumCommitmentCellProps) {
  return <ValueDisplayer name="Minimum commitment" value={minimumCommitment} />;
}

interface HistoricalAprCellProps {
  historicalApr?: string;
}
function HistoricalAprCell({ historicalApr = '10%' }: HistoricalAprCellProps) {
  return <ValueDisplayer name="Historical yield" value={historicalApr} />;
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
      name="Total value locked"
      value={
        <>
          {totalValueLocked} <Box textStyle="label.03">{totalValueLockedUsd}</Box>
        </>
      }
    />
  );
}

interface ProtocolOverviewProps {
  protocol: Protocol;
  protocolSlug: string;
}
function getPostSlugForProtocol(protocolSlug: string): string | undefined {
  switch (protocolSlug) {
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
    case 'lisa':
      return 'lisa';
    default:
      return undefined;
  }
}
function ProtocolCell({ protocol, protocolSlug }: ProtocolOverviewProps) {
  const postSlug = getPostSlugForProtocol(protocolSlug);
  const post = usePost(postSlug || '');
  return (
    <VStack gap="space.05" alignItems="left" p="space.05">
      {protocol.icon}
      <styled.h4 textStyle="label.01">
        {protocol.name}
      </styled.h4>
      {post && (
        <styled.p textStyle="caption.01">
          {post.Sentence}
          {getLearnMoreLink(post.Slug, post.Sentence)}
        </styled.p>
      )}
    </VStack>
  );
}

export function ProtocolOverview({ protocol, protocolSlug }: ProtocolOverviewProps) {
  return (
    <InfoGrid
      width="100%"
      gridTemplateColumns={['repeat(1, 1fr)', 'repeat(1, 1fr)', 'repeat(3, 1fr)']}
      gridTemplateRows={['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto']}
      height="fit-content"
      className={css({ '& > *:not(:first-child)': { height: ['120px', null, 'unset'] } })}
      borderTop="0px"
      borderLeft="0px"
      borderRight="0px"
      borderRadius="0px"
    >
      <InfoGrid.Cell gridColumn={['span 1', 'span 1', 'auto']} gridRow={['1', '1', 'span 2']}>
        <ProtocolCell protocol={protocol} protocolSlug={protocolSlug} />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['1', '1', '2']} gridRow={['2', '2', '1']}>
        <ValueDisplayer
          name={<PostLabelHoverCard postKey="historical-yield" textStyle="label.02" />}
          value={"—"}
        />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['1', '1', '3']} gridRow={['3', '3', '1']}>
        <ValueDisplayer
          name={<PostLabelHoverCard postKey="total-locked-value-tvl" textStyle="label.02" />}
          value={"—"}
        />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['1', '1', '2']} gridRow={['4', '4', '2']}>
        <ValueDisplayer
          name={<PostLabelHoverCard postKey="stacking-rewards-tokens" textStyle="label.02" />}
          value={<>{protocol.liquidToken} <Box textStyle="label.03">—</Box></>}
        />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['1', '1', '3']} gridRow={['5', '5', '2']}>
        <ValueDisplayer
          name={<PostLabelHoverCard postKey="stacking-minimum-commitment" textStyle="label.02" />}
          value={protocol.minimumDelegationAmount}
        />
      </InfoGrid.Cell>
    </InfoGrid>
  );
}
