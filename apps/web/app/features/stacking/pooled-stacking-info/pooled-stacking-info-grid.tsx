import { ReactNode } from 'react';

import { Box, GridProps } from 'leather-styles/jsx';
import { SbtcLogo } from '~/components/icons/sbtc-logo';
import { ValueDisplayer } from '~/components/value-displayer/default-value-displayer';
import { DASH } from '~/constants/constants';
import { CopyAddress } from '~/features/stacking/components/address';
import { StackingInfoGridLayout } from '~/features/stacking/components/stacking-info-grid.layout';
import { PoolRewardProtocolInfo } from '~/features/stacking/start-pooled-stacking/components/preset-pools';
import {
  daysToWeek,
  toHumanReadableDays,
  toHumanReadableStx,
  toHumanReadableWeeks,
} from '~/utils/unit-convert';

import { Flag } from '@leather.io/ui';

interface RewardProtocolCellProps {
  rewardProtocol: PoolRewardProtocolInfo;
}
function RewardProtocolEnrollCell({ rewardProtocol }: RewardProtocolCellProps) {
  return (
    <ValueDisplayer
      gap="space.04"
      name="Status"
      value={
        <Box textStyle="label.03" color="green.action-primary-default">
          {rewardProtocol.status}
        </Box>
      }
    />
  );
}

interface PoolNameProps {
  icon: ReactNode;
  name: string;
}
function PoolNameCell({ icon, name }: PoolNameProps) {
  return (
    <ValueDisplayer
      gap="space.04"
      name={icon}
      value={
        <Box textStyle="label.03" textDecoration="underline">
          {name}
        </Box>
      }
    />
  );
}

function TotalValueLockedCell({ rewardProtocol }: RewardProtocolCellProps) {
  return (
    <ValueDisplayer
      gap="space.04"
      name="Total Value Locked (TVL)"
      value={
        <>
          {rewardProtocol.tvl || DASH}
          {rewardProtocol.tvl ? <Box textStyle="label.03">{rewardProtocol.tvlUsd}</Box> : null}
        </>
      }
    />
  );
}

function HistoricalAprCell({ rewardProtocol }: RewardProtocolCellProps) {
  return <ValueDisplayer gap="space.04" name="Historical yield" value={rewardProtocol.apr || DASH} />;
}

function PoolAddressCell({ rewardProtocol }: RewardProtocolCellProps) {
  return (
    <ValueDisplayer
      gap="space.04"
      name="Pool address"
      value={<CopyAddress address={rewardProtocol.poolAddress} />}
    />
  );
}

function RewardAddressCell({ rewardProtocol }: RewardProtocolCellProps) {
  if (!rewardProtocol.rewardAddress) {
    return DASH;
  }

  return (
    <ValueDisplayer
      gap="space.04"
      name="Reward address"
      value={<CopyAddress address={rewardProtocol.rewardAddress} />}
    />
  );
}

function MinimumCommitmentCell({ rewardProtocol }: RewardProtocolCellProps) {
  return (
    <ValueDisplayer
      gap="space.04"
      name="Minimum Commitment"
      value={
        <>
          {toHumanReadableStx(rewardProtocol.minCommitment)}
          <Box textStyle="label.03">{rewardProtocol.minCommitmentUsd}</Box>
        </>
      }
    />
  );
}

function MinimumLockupPeriodCell({
  rewardProtocol: { minLockupPeriodDays },
}: RewardProtocolCellProps) {
  return (
    <ValueDisplayer
      gap="space.04"
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

function NextCycleCell({ rewardProtocol }: RewardProtocolCellProps) {
  return (
    <ValueDisplayer
      gap="space.04"
      name="Days until next cycle"
      value={
        <>
          <Box textStyle="label.01">{toHumanReadableDays(rewardProtocol.nextCycleDays)}</Box>
          <Box textStyle="label.03">
            Cycle {rewardProtocol.nextCycleNumber} - {rewardProtocol.nextCycleBlocks} blocks
          </Box>
        </>
      }
    />
  );
}

function RewardsTokenCell({ rewardProtocol }: RewardProtocolCellProps) {
  return (
    <ValueDisplayer
      gap="space.04"
      name="Rewards token"
      value={
        <Flag
          spacing="space.02"
          img={rewardProtocol.rewardsToken === 'sBTC' && <SbtcLogo size={24} />}
        >
          {rewardProtocol.rewardsToken}
        </Flag>
      }
    />
  );
}

interface PooledStackingInfoGridProps extends GridProps {
  poolIcon: ReactNode;
  poolName: string;
  rewardProtocol: PoolRewardProtocolInfo;
}

export function PooledStackingInfoGrid({
  poolIcon,
  poolName,
  rewardProtocol,
  ...props
}: PooledStackingInfoGridProps) {
  return (
    <StackingInfoGridLayout
      cells={{
        name: <PoolNameCell icon={poolIcon} name={poolName} />,
        status: <RewardProtocolEnrollCell rewardProtocol={rewardProtocol} />,
        historicalApr: (
          <HistoricalAprCell key={`${rewardProtocol.id}-apr`} rewardProtocol={rewardProtocol} />
        ),
        minimumLockupPeriod: (
          <MinimumLockupPeriodCell
            key={`${rewardProtocol.id}-minimum-lockup-period`}
            rewardProtocol={rewardProtocol}
          />
        ),
        totalValueLocked: (
          <TotalValueLockedCell key={`${rewardProtocol.id}-tvl`} rewardProtocol={rewardProtocol} />
        ),
        daysUntilNextCycle: (
          <NextCycleCell key={`${rewardProtocol.id}-next-cycle`} rewardProtocol={rewardProtocol} />
        ),
        rewardsToken: (
          <RewardsTokenCell key={`${rewardProtocol.id}-token`} rewardProtocol={rewardProtocol} />
        ),
        minimumCommitment: (
          <MinimumCommitmentCell
            key={`${rewardProtocol.id}-minCommitment`}
            rewardProtocol={rewardProtocol}
          />
        ),
        poolAddress: (
          <PoolAddressCell
            key={`${rewardProtocol.id}-pool-address`}
            rewardProtocol={rewardProtocol}
          />
        ),
        rewardAddress: (
          <RewardAddressCell
            key={`${rewardProtocol.id}-reward-address`}
            rewardProtocol={rewardProtocol}
          />
        ),
      }}
      {...props}
    />
  );
}
