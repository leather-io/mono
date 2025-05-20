import { css } from 'leather-styles/css';
import { Box, VStack, styled } from 'leather-styles/jsx';
import { InfoGrid } from '~/components/info-grid/info-grid';
import { ValueDisplayer } from '~/components/value-displayer/default-value-displayer';
import { PoolRewardProtocolInfo } from '~/features/stacking/start-pooled-stacking/components/preset-pools';
import { daysToWeek, toHumanReadableDays, toHumanReadableWeeks } from '~/utils/unit-convert';

interface RewardTokenCellProps {
  token?: string;
  value?: string;
}
function RewardTokenCell({ token = 'STX', value }: RewardTokenCellProps) {
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
  minLockupPeriodDays: number;
}
function LockupPeriodCell({ minLockupPeriodDays }: LockupPeriodCellProps) {
  return (
    <ValueDisplayer
      name="Minimum lockup period"
      value={
        <>
          <Box textStyle="label.01">1 Cycle</Box>
          <Box textStyle="label.03">
            {toHumanReadableWeeks(daysToWeek(minLockupPeriodDays))} (~
            {toHumanReadableDays(minLockupPeriodDays)})
          </Box>
        </>
      }
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
  nextCycleBlocks,
  nextCycleNumber,
}: DaysUntilNextCycleCellProps) {
  return (
    <ValueDisplayer
      name="Days until next cycle"
      value={
        <>
          <Box textStyle="label.01">{toHumanReadableDays(daysUntilNextCycle)}</Box>
          <Box textStyle="label.03">
            Cycle {nextCycleNumber} - {nextCycleBlocks} blocks
          </Box>
        </>
      }
    />
  );
}

interface MinimumCommitmentCellProps {
  minimumCommitment: string;
}
function MinimumCommitmentCell({ minimumCommitment }: MinimumCommitmentCellProps) {
  return <ValueDisplayer name="Minimum commitment" value={<>{minimumCommitment}</>} />;
}

interface HistoricalAprCellProps {
  historicalApr: string;
}
function HistoricalAprCell({ historicalApr }: HistoricalAprCellProps) {
  return <ValueDisplayer name="Historical APR" value={<>{historicalApr}</>} />;
}

interface TotalValueLockedCellProps {
  totalValueLocked: string;
  totalValueLockedUsd: string;
}
function TotalValueLockedCell({
  totalValueLocked,
  totalValueLockedUsd,
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

interface PoolOverviewProps {
  pool: PoolRewardProtocolInfo;
}
function PoolCell({ pool }: PoolOverviewProps) {
  return (
    <VStack gap="space.05" alignItems="left" p="space.05">
      {pool.logo}
      <styled.h4 textDecoration="underline" textStyle="label.01">
        {pool.title}
      </styled.h4>
      <styled.p textStyle="caption.01">{pool.description}</styled.p>
    </VStack>
  );
}

export function PoolOverview({ pool }: PoolOverviewProps) {
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
        <PoolCell pool={pool} />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['1', '1', '2']} gridRow={['2', '2', '1']}>
        <HistoricalAprCell historicalApr={pool.apr} />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['2', '2', '2']} gridRow={['2', '2', '2']}>
        <LockupPeriodCell minLockupPeriodDays={pool.minLockupPeriodDays} />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['1', '1', '3']} gridRow={['3', '3', '1']}>
        <TotalValueLockedCell totalValueLocked={pool.tvl} totalValueLockedUsd={pool.tvlUsd} />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['2', '2', '3']} gridRow={['3', '3', '2']}>
        <DaysUntilNextCycleCell
          daysUntilNextCycle={pool.nextCycleDays}
          nextCycleBlocks={pool.nextCycleBlocks}
          nextCycleNumber={pool.nextCycleNumber}
        />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['1', '1', '4']} gridRow={['4', '4', '1']}>
        <RewardTokenCell token={pool.rewardsToken} />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['2', '2', '4']} gridRow={['4', '4', '2']}>
        <MinimumCommitmentCell minimumCommitment={pool.minCommitment} />
      </InfoGrid.Cell>
    </InfoGrid>
  );
}
