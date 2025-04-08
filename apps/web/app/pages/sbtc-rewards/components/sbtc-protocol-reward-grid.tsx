import { Box, Flex, GridProps, styled } from 'leather-styles/jsx';
import { SbtcLogo } from '~/components/icons/sbtc-logo';

import { Flag } from '@leather.io/ui';

import { RewardProtocolInfo } from '../sbtc-rewards';
import { ValueDisplayer } from './reward-value-displayer';
import { SbtcProtocolRewardGridLayout } from './sbtc-protocol-reward-grid.layout';

interface RewardProtocolCellProps {
  rewardProtocol: RewardProtocolInfo;
}

function RewardProtocolEnrollCell({
  rewardProtocol,
  action,
}: RewardProtocolCellProps & { action: React.ReactElement }) {
  return (
    <Flex flex={1} justifyContent="space-between" flexDir="column" p="space.05" minH="246px">
      {rewardProtocol.logo}
      <Box>
        <styled.h3 textStyle="heading.05" mt="space.05">
          {rewardProtocol.title}
        </styled.h3>
        <styled.p textStyle="caption.01" mt="space.01">
          {rewardProtocol.description}
        </styled.p>
        <Box mt="space.04">{action}</Box>
      </Box>
    </Flex>
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

function PayoutTokenCell({ rewardProtocol }: RewardProtocolCellProps) {
  return (
    <ValueDisplayer
      name="Payout token"
      value={
        <Flag
          spacing="space.02"
          img={rewardProtocol.payoutToken === 'sBTC' && <SbtcLogo size={24} />}
        >
          {rewardProtocol.payoutToken}
        </Flag>
      }
    />
  );
}

interface SbtcProtocolRewardGridProps extends GridProps {
  rewardProtocol: RewardProtocolInfo;
  enrollAction: React.ReactElement;
}
export function SbtcProtocolRewardGrid({
  rewardProtocol,
  enrollAction,
  ...props
}: SbtcProtocolRewardGridProps) {
  return (
    <SbtcProtocolRewardGridLayout
      primaryCell={
        <RewardProtocolEnrollCell rewardProtocol={rewardProtocol} action={enrollAction} />
      }
      cells={[
        <TotalValueLockedCell key={`${rewardProtocol.id}-tvl`} rewardProtocol={rewardProtocol} />,
        <HistoricalAprCell key={`${rewardProtocol.id}-apr`} rewardProtocol={rewardProtocol} />,
        <MinimumCommitmentCell
          key={`${rewardProtocol.id}-minCommitment`}
          rewardProtocol={rewardProtocol}
        />,
        <PayoutTokenCell key={`${rewardProtocol.id}-token`} rewardProtocol={rewardProtocol} />,
      ]}
      {...props}
    />
  );
}
