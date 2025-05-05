import { Box, GridProps } from 'leather-styles/jsx';
import { SbtcLogo } from '~/components/icons/sbtc-logo';
import { ValueDisplayer } from '~/components/value-displayer/default-value-displayer';
import { StackingInfoGridLayout } from '~/features/stacking/components/stacking-info-grid.layout';
import { PoolRewardProtocolInfo } from '~/features/stacking/start-pooled-stacking/components/preset-pools';

import { Flag } from '@leather.io/ui';

interface RewardProtocolCellProps {
  rewardProtocol: PoolRewardProtocolInfo;
}

function RewardProtocolEnrollCell({ rewardProtocol }: RewardProtocolCellProps) {
  return (
    <ValueDisplayer
      name="Status"
      value={
        <Box textStyle="label.03" color="green.action-primary-default">
          {rewardProtocol.status}
        </Box>
      }
    />
  );
}

function TotalValueLockedCell({ rewardProtocol }: RewardProtocolCellProps) {
  return (
    <ValueDisplayer
      name="Total Value Locked (TVL)"
      value={
        <>
          {rewardProtocol.tvl}
          <Box textStyle="label.03">{rewardProtocol.tvlUsd}</Box>
        </>
      }
    />
  );
}

function HistoricalAprCell({ rewardProtocol }: RewardProtocolCellProps) {
  return <ValueDisplayer name="Historical APR" value={rewardProtocol.apr} />;
}

function PoolAddressCell({ rewardProtocol }: RewardProtocolCellProps) {
  return <ValueDisplayer name="Pool address" value={rewardProtocol.poolAddress} />;
}

function RewardAddressCell({ rewardProtocol }: RewardProtocolCellProps) {
  return <ValueDisplayer name="Reward address" value={rewardProtocol.rewardAddress} />;
}

function MinimumCommitmentCell({ rewardProtocol }: RewardProtocolCellProps) {
  return (
    <ValueDisplayer
      name="Minimum Commitment"
      value={
        <>
          {rewardProtocol.minCommitment}
          <Box textStyle="label.03">{rewardProtocol.minCommitmentUsd}</Box>
        </>
      }
    />
  );
}

function MinimumLockupPeriodCell({ rewardProtocol }: RewardProtocolCellProps) {
  return (
    <ValueDisplayer
      name="Minimum lockup period"
      value={
        <>
          <Box textStyle="label.01">1 Cycle</Box>
          <Box textStyle="label.03">
            {Math.round(rewardProtocol.minLockupPeriodDays / 7)} weeks (~
            {rewardProtocol.minLockupPeriodDays} days)
          </Box>
        </>
      }
    />
  );
}

function NextCycleCell({ rewardProtocol }: RewardProtocolCellProps) {
  return (
    <ValueDisplayer
      name="Days until next cycle"
      value={
        <>
          <Box textStyle="label.01">{rewardProtocol.nextCycleDays} days</Box>
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
  rewardProtocol: PoolRewardProtocolInfo;
}

export function PooledStackingInfoGrid({ rewardProtocol, ...props }: PooledStackingInfoGridProps) {
  return (
    <StackingInfoGridLayout
      primaryCell={<RewardProtocolEnrollCell rewardProtocol={rewardProtocol} />}
      cells={[
        <HistoricalAprCell key={`${rewardProtocol.id}-apr`} rewardProtocol={rewardProtocol} />,
        <MinimumLockupPeriodCell
          key={`${rewardProtocol.id}-minimum-lockup-period`}
          rewardProtocol={rewardProtocol}
        />,
        <TotalValueLockedCell key={`${rewardProtocol.id}-tvl`} rewardProtocol={rewardProtocol} />,
        <NextCycleCell key={`${rewardProtocol.id}-next-cycle`} rewardProtocol={rewardProtocol} />,
        <RewardsTokenCell key={`${rewardProtocol.id}-token`} rewardProtocol={rewardProtocol} />,
        <MinimumCommitmentCell
          key={`${rewardProtocol.id}-minCommitment`}
          rewardProtocol={rewardProtocol}
        />,
      ]}
      bottomCells={[
        <PoolAddressCell
          key={`${rewardProtocol.id}-pool-address`}
          rewardProtocol={rewardProtocol}
        />,
        <RewardAddressCell
          key={`${rewardProtocol.id}-reward-address`}
          rewardProtocol={rewardProtocol}
        />,
      ]}
      {...props}
    />
  );
}
