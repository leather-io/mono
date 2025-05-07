import { css } from 'leather-styles/css';
import { Box, VStack, styled } from 'leather-styles/jsx';
import { InfoGrid } from '~/components/info-grid/info-grid';
import { ValueDisplayer } from '~/components/value-displayer/default-value-displayer';
import { Protocol } from '~/features/stacking/start-liquid-stacking/utils/types-preset-protocols';

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
  return <ValueDisplayer name="Historical APR" value={historicalApr} />;
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
function ProtocolCell({ protocol }: ProtocolOverviewProps) {
  return (
    <VStack gap="space.05" alignItems="left" p="space.05">
      {protocol.icon}
      <styled.h4 textDecoration="underline" textStyle="label.01">
        {protocol.name}
      </styled.h4>
      <styled.p textStyle="caption.01">{protocol.description}</styled.p>
    </VStack>
  );
}

export function ProtocolOverview({ protocol, protocolSlug }: ProtocolOverviewProps) {
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
        <ProtocolCell protocol={protocol} protocolSlug={protocolSlug} />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['1', '1', '2']} gridRow={['2', '2', '1']}>
        <HistoricalAprCell />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['2', '2', '2']} gridRow={['2', '2', '2']}>
        <LockupPeriodCell />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['1', '1', '3']} gridRow={['3', '3', '1']}>
        <TotalValueLockedCell />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['2', '2', '3']} gridRow={['3', '3', '2']}>
        <DaysUntilNextCycleCell />
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
