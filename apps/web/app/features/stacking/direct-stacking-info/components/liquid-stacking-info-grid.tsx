import { StackerInfo } from '@stacks/stacking';
import BigNumber from 'bignumber.js';
import { Box, GridProps } from 'leather-styles/jsx';
import { CopyAddress } from '~/features/stacking/components/address';
import { LiquidStackingInfoGridLayout } from '~/features/stacking/direct-stacking-info/components/liquid-stacking-info-grid.layout';
import { StackExtendInfo } from '~/features/stacking/direct-stacking-info/get-has-pending-stack-extend';
import { ProtocolSlug } from '~/features/stacking/start-liquid-stacking/utils/types-preset-protocols';
import { PoolRewardProtocolInfo } from '~/features/stacking/start-pooled-stacking/components/preset-pools';
import { ValueDisplayer } from '~/pages/sbtc-rewards/components/reward-value-displayer';
import { useStacksNetwork } from '~/store/stacks-network';
import { formatPoxAddressToNetwork } from '~/utils/stacking-pox';
import { toHumanReadableStx } from '~/utils/unit-convert';

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

function StackingCell({ lockedAmount }: Pick<LiquidStackingInfoGridProps, 'lockedAmount'>) {
  return <ValueDisplayer name="You're stacking" value={toHumanReadableStx(lockedAmount)} />;
}

function DurationCell({
  stackerInfoDetails,
  rewardCycleId,
}: Pick<LiquidStackingInfoGridProps, 'stackerInfoDetails' | 'rewardCycleId'>) {
  const elapsedCyclesSinceStackingStart = Math.max(
    rewardCycleId - stackerInfoDetails.first_reward_cycle,
    0
  );
  const elapsedStackingCycles = Math.min(
    elapsedCyclesSinceStackingStart,
    stackerInfoDetails.lock_period
  );
  return (
    <ValueDisplayer
      name="Duration"
      value={`${elapsedStackingCycles} / ${stackerInfoDetails.lock_period}`}
    />
  );
}

function StartCycleCell({
  stackerInfoDetails,
}: Pick<LiquidStackingInfoGridProps, 'stackerInfoDetails'>) {
  return <ValueDisplayer name="Start" value={`Cycle ${stackerInfoDetails.first_reward_cycle}`} />;
}

function EndCycleCell({
  stackerInfoDetails,
}: Pick<LiquidStackingInfoGridProps, 'stackerInfoDetails'>) {
  return (
    <ValueDisplayer
      name="End"
      value={`Cycle ${stackerInfoDetails.first_reward_cycle + stackerInfoDetails.lock_period - 1}`}
    />
  );
}

function BitcoinAddressCell({
  stackerInfoDetails,
}: Pick<LiquidStackingInfoGridProps, 'stackerInfoDetails'>) {
  const { network } = useStacksNetwork();
  const poxAddress = formatPoxAddressToNetwork(network, stackerInfoDetails.pox_address);
  return <ValueDisplayer name="Bitcoin address" value={<CopyAddress address={poxAddress} />} />;
}

type ActiveStackerInfo = StackerInfo & {
  stacked: true;
};

interface LiquidStackingInfoGridProps extends GridProps {
  rewardProtocol: PoolRewardProtocolInfo;
  lockedAmount: BigNumber;
  stackerInfoDetails: ActiveStackerInfo['details'];
  rewardCycleId: number;
  pendingStackExtend: StackExtendInfo | undefined | null;
  protocolSlug: ProtocolSlug;
}

export function LiquidStackingInfoGrid({
  rewardProtocol,
  lockedAmount,
  rewardCycleId,
  stackerInfoDetails,
  ...props
}: LiquidStackingInfoGridProps) {
  return (
    <LiquidStackingInfoGridLayout
      primaryCell={<RewardProtocolEnrollCell rewardProtocol={rewardProtocol} />}
      cells={[
        <StackingCell key={`${rewardProtocol.id}-stacking`} lockedAmount={lockedAmount} />,
        <DurationCell
          key={`${rewardProtocol.id}-duration`}
          rewardCycleId={rewardCycleId}
          stackerInfoDetails={stackerInfoDetails}
        />,
        <StartCycleCell
          key={`${rewardProtocol.id}-start-cycle`}
          stackerInfoDetails={stackerInfoDetails}
        />,
        <EndCycleCell
          key={`${rewardProtocol.id}-end-cycle`}
          stackerInfoDetails={stackerInfoDetails}
        />,
      ]}
      bottomCells={[
        <BitcoinAddressCell
          key={`${rewardProtocol.id}-bitcoin-address`}
          stackerInfoDetails={stackerInfoDetails}
        />,
        undefined,
      ]}
      {...props}
    />
  );
}
