import { css } from 'leather-styles/css';
import { Box, VStack, styled } from 'leather-styles/jsx';
import { DummyIcon } from '~/components/dummy';
import { InfoGrid } from '~/components/info-grid/info-grid';
import { Pool } from '~/features/stacking/start-pooled-stacking/utils/types-preset-pools';
import { ValueDisplayer } from '~/pages/sbtc-rewards/components/reward-value-displayer';

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
  return <ValueDisplayer name="Minimum lockup period" value={<>{lockupPeriod}</>} />;
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
  return <ValueDisplayer name="Minimum commitment" value={<>{minimumCommitment}</>} />;
}

interface HistoricalAprCellProps {
  historicalApr?: string;
}
function HistoricalAprCell({ historicalApr = '10%' }: HistoricalAprCellProps) {
  return <ValueDisplayer name="Historical APR" value={<>{historicalApr}</>} />;
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

interface PoolOverviewProps {
  pool: Pool;
  poolSlug: string;
}
function PoolCell({ pool, poolSlug }: PoolOverviewProps) {
  return (
    <VStack gap="space.05" alignItems="left" p="space.05">
      {pool ? pool.icon : <DummyIcon />}
      {pool && poolSlug && <styled.h4 textStyle="label.01">{pool.name}</styled.h4>}
      {pool.description && <styled.p textStyle="caption.01">{pool.description}</styled.p>}
    </VStack>
  );
}

export function PoolOverview({ pool, poolSlug }: PoolOverviewProps) {
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
        <HistoricalAprCell />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['2', '2', '2']} gridRow={['2', '2', '2']}>
        <DaysUntilNextCycleCell />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['1', '1', '3']} gridRow={['3', '3', '1']}>
        <TotalValueLockedCell />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['2', '2', '3']} gridRow={['3', '3', '2']}>
        <LockupPeriodCell />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['1', '1', '4']} gridRow={['4', '4', '1']}>
        <RewardTokenCell />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['2', '2', '4']} gridRow={['4', '4', '2']}>
        <MinimumCommitmentCell />
      </InfoGrid.Cell>
    </InfoGrid>
  );
}
