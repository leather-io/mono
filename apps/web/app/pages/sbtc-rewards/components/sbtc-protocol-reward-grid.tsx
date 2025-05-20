import { Box, Flex, GridProps, styled } from 'leather-styles/jsx';
import { SbtcLogo } from '~/components/icons/sbtc-logo';
import { ValueDisplayer } from '~/components/value-displayer/default-value-displayer';

import { Flag } from '@leather.io/ui';

import { RewardProtocolInfo } from '../sbtc-rewards';
import { SbtcProtocolRewardGridLayout } from './sbtc-protocol-reward-grid.layout';
import { PostLabelHoverCard } from '~/components/post-label-hover-card';
import { content } from '~/data/content';
import { getLearnMoreLink } from '~/features/page/page';

interface RewardProtocolCellProps {
  rewardProtocol: RewardProtocolInfo;
}

function RewardProtocolEnrollCell({
  rewardProtocol,
  action,
}: RewardProtocolCellProps & { action: React.ReactElement }) {
  // Map protocol id to post slug
  const protocolSlugMap: Record<string, string> = {
    basic: 'sbtc-rewards-basic',
    alex: 'alex-sbtc-pools',
    bitflow: 'bitflow-sbtc-pools',
    velar: 'velar-sbtc-pools',
    zest: 'zest-sbtc-pools',
  };
  const postSlug = protocolSlugMap[rewardProtocol.id];
  const post = postSlug ? (content.posts as Record<string, any>)[postSlug] : undefined;
  return (
    <Flex flex={1} justifyContent="space-between" flexDir="column" p="space.05" minH="246px">
      {rewardProtocol.logo}
      <Box>
        <styled.h3 textStyle="heading.05" mt="space.05">
          {rewardProtocol.title}
        </styled.h3>
        {post && (
          <styled.p textStyle="caption.01" mt="space.01">
            {post.prompt}
            {getLearnMoreLink(post.slug, post.prompt)}
          </styled.p>
        )}
        {!post && (
          <styled.p textStyle="caption.01" mt="space.01">
            {rewardProtocol.description}
          </styled.p>
        )}
        <Box mt="space.04">{action}</Box>
      </Box>
    </Flex>
  );
}

function TotalValueLockedCell({ rewardProtocol }: RewardProtocolCellProps) {
  return (
    <ValueDisplayer
      name={
        <PostLabelHoverCard
          postKey="total-locked-value-tvl"
          label="Total Value Locked (TVL)"
          textStyle="label.03"
        />
      }
      value={
        <>
          {rewardProtocol.tvl}
          <Box textStyle="label.03">{rewardProtocol.tvlUsd}</Box>
        </>
      }
      textAlign="left"
    />
  );
}

function HistoricalAprCell({ rewardProtocol }: RewardProtocolCellProps) {
  return (
    <ValueDisplayer
      name={
        <PostLabelHoverCard
          postKey="historical-yield"
          label="Historical yield"
          textStyle="label.03"
        />
      }
      value={rewardProtocol.apr}
      textAlign="left"
    />
  );
}

function MinimumCommitmentCell({ rewardProtocol }: RewardProtocolCellProps) {
  return (
    <ValueDisplayer
      name={
        <PostLabelHoverCard
          postKey="sbtc-rewards-minimum-commitment"
          label="Minimum commitment"
          textStyle="label.03"
        />
      }
      value={
        <>
          {rewardProtocol.minCommitment}
          <Box textStyle="label.03">{rewardProtocol.minCommitmentUsd}</Box>
        </>
      }
      textAlign="left"
    />
  );
}

function PayoutTokenCell({ rewardProtocol }: RewardProtocolCellProps) {
  return (
    <ValueDisplayer
      name={
        <PostLabelHoverCard
          postKey="sbtc-rewards-tokens"
          label="Rewards token"
          textStyle="label.03"
        />
      }
      value={
        <Flag
          spacing="space.02"
          img={rewardProtocol.payoutToken === 'sBTC' && <SbtcLogo size={24} />}
        >
          {rewardProtocol.payoutToken}
        </Flag>
      }
      textAlign="left"
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
