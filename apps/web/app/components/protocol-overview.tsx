import { ReactNode } from 'react';

import { css } from 'leather-styles/css';
import { Box, VStack, styled } from 'leather-styles/jsx';
import { InfoGrid } from '~/components/info-grid/info-grid';
import { ValueDisplayer } from '~/components/value-displayer/default-value-displayer';
import { CopyAddress } from '~/features/stacking/components/address';
import { ProtocolInfo } from '~/queries/protocols/use-protocol-info';
import {
  toHumanReadableDays,
  toHumanReadablePercent,
  toHumanReadableStx,
} from '~/utils/unit-convert';

import { Flag } from '@leather.io/ui';

interface RewardTokenCellProps {
  icon: ReactNode;
  symbol: string;
}
function RewardTokenCell({ icon, symbol }: RewardTokenCellProps) {
  return (
    <ValueDisplayer
      name="Rewards token"
      value={
        <Flag spacing="space.02" img={icon}>
          {symbol}
        </Flag>
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
          {toHumanReadableDays(daysUntilNextCycle)}{' '}
          <Box textStyle="label.03">
            Cycle {nextCycleNumber} - {nextCycleBlocks} blocks
          </Box>
        </>
      }
    />
  );
}

interface MinimumCommitmentCellProps {
  minimumCommitment?: number;
  minimumCommitmentUsd?: string;
}
function MinimumCommitmentCell({
  minimumCommitment,
  minimumCommitmentUsd,
}: MinimumCommitmentCellProps) {
  return (
    <ValueDisplayer
      name="Minimum commitment"
      value={
        <>
          {toHumanReadableStx(minimumCommitment || 0)}{' '}
          <Box textStyle="label.03">{minimumCommitmentUsd}</Box>
        </>
      }
    />
  );
}

interface HistoricalAprCellProps {
  apr?: number;
}
function HistoricalAprCell({ apr }: HistoricalAprCellProps) {
  return <ValueDisplayer name="Historical APR" value={toHumanReadablePercent(apr || 0)} />;
}

interface TotalValueLockedCellProps {
  totalValueLocked?: number;
  totalValueLockedUsd?: string;
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
          {toHumanReadableStx(totalValueLocked || 0)}{' '}
          <Box textStyle="label.03">{totalValueLockedUsd}</Box>
        </>
      }
    />
  );
}

interface ProtocolCellProps {
  icon: ReactNode;
  name: string;
  description: string;
}
function ProtocolCell({ description, icon, name }: ProtocolCellProps) {
  return (
    <VStack gap="space.05" alignItems="left" p="space.05">
      {icon}
      <styled.h4 textDecoration="underline" textStyle="label.01">
        {name}
      </styled.h4>
      <styled.p textStyle="caption.01">{description}</styled.p>
    </VStack>
  );
}

interface ProtocolStatusProps {
  status: string;
}
function ProtocolStatusCell({ status }: ProtocolStatusProps) {
  return (
    <ValueDisplayer
      gap="space.04"
      name="Status"
      value={
        <Box textStyle="label.03" color="green.action-primary-default">
          {status}
        </Box>
      }
    />
  );
}

interface ContractAddressCell {
  address: string;
}

function ContractAddressCell({ address }: ContractAddressCell) {
  return (
    <ValueDisplayer
      gap="space.04"
      name="Contract address"
      value={<CopyAddress address={address} />}
    />
  );
}

export interface ProtocolOverviewProps {
  info: ProtocolInfo;
  isStackingPage?: boolean;
}

export function ProtocolOverview({ isStackingPage, info }: ProtocolOverviewProps) {
  const isStackingPageOrUndefined = isStackingPage ? true : undefined;

  return (
    <VStack gap="0">
      <InfoGrid
        width="100%"
        gridTemplateColumns={['repeat(2, 1fr)', 'repeat(2, 1fr)', 'repeat(4, 1fr)']}
        gridTemplateRows={['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto']}
        height="fit-content"
        className={css({ '& > *:not(:first-child)': { height: ['120px', null, 'unset'] } })}
        borderTop={isStackingPageOrUndefined && '0px'}
        borderLeft={isStackingPageOrUndefined && '0px'}
        borderRight={isStackingPageOrUndefined && '0px'}
        borderRadius={isStackingPageOrUndefined && '0px'}
      >
        <InfoGrid.Cell gridColumn={['span 2', 'span 2', 'auto']} gridRow={['1', '1', 'span 2']}>
          {isStackingPageOrUndefined ? (
            <ProtocolCell icon={info.logo} name={info.name} description={info.description} />
          ) : (
            <ProtocolStatusCell status="Active" />
          )}
        </InfoGrid.Cell>
        <InfoGrid.Cell gridColumn={['1', '1', '2']} gridRow={['2', '2', '1']}>
          <HistoricalAprCell apr={info.apr} />
        </InfoGrid.Cell>
        <InfoGrid.Cell gridColumn={['2', '2', '2']} gridRow={['2', '2', '2']}>
          <LockupPeriodCell />
        </InfoGrid.Cell>
        <InfoGrid.Cell gridColumn={['1', '1', '3']} gridRow={['3', '3', '1']}>
          <TotalValueLockedCell totalValueLocked={info.tvl} totalValueLockedUsd={info.tvlUsd} />
        </InfoGrid.Cell>
        <InfoGrid.Cell gridColumn={['2', '2', '3']} gridRow={['3', '3', '2']}>
          <DaysUntilNextCycleCell
            daysUntilNextCycle={info.nextCycleDays}
            nextCycleBlocks={info.nextCycleBlocks}
            nextCycleNumber={info.nextCycleNumber}
          />
        </InfoGrid.Cell>
        <InfoGrid.Cell gridColumn={['1', '1', '4']} gridRow={['4', '4', '1']}>
          <RewardTokenCell icon={info.payoutIcon} symbol={info.payout} />
        </InfoGrid.Cell>
        <InfoGrid.Cell gridColumn={['2', '2', '4']} gridRow={['4', '4', '2']}>
          <MinimumCommitmentCell
            minimumCommitment={info.minimumCommitment}
            minimumCommitmentUsd={info.minimumCommitmentUsd}
          />
        </InfoGrid.Cell>
      </InfoGrid>
      {!isStackingPageOrUndefined && (
        <InfoGrid
          borderTop="none"
          borderTopRadius="0"
          mt="0"
          width="100%"
          display={['none', 'none', 'grid']}
          gridTemplateColumns="repeat(2, 1fr)"
          gridTemplateRows="auto"
          height="fit-content"
        >
          <InfoGrid.Cell>
            <ContractAddressCell address={info.contractAddress} />
          </InfoGrid.Cell>
        </InfoGrid>
      )}
    </VStack>
  );
}
