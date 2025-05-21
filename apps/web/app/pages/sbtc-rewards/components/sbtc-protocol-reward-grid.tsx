import { Box, Flex, GridProps, styled } from 'leather-styles/jsx';
import { SbtcLogo } from '~/components/icons/sbtc-logo';
import { ValueDisplayer } from '~/components/value-displayer/default-value-displayer';

import { Flag } from '@leather.io/ui';

import { RewardProtocolInfo } from '../sbtc-rewards';
import { SbtcProtocolRewardGridLayout } from './sbtc-protocol-reward-grid.layout';
import { PostLabelHoverCard } from '~/components/post-label-hover-card';
import { content } from '~/data/content';
import { getLearnMoreLink } from '~/features/page/page';
import { getPosts } from '~/utils/post-utils';

interface RewardProtocolCellProps {
  rewardProtocol: RewardProtocolInfo;
}

function RewardProtocolEnrollCell({
  rewardProtocol,
  action,
}: RewardProtocolCellProps & { action: React.ReactElement }) {
  // Map protocol id to post key in camelCase
  const protocolKeyMap: Record<string, string> = {
    basic: 'sbtcRewardsBasic',
    alex: 'alexSbtcPools',
    bitflow: 'bitflowSbtcPools',
    velar: 'velarSbtcPools',
    zest: 'zestSbtcPools',
  };
  const posts = getPosts();
  const postKey = protocolKeyMap[rewardProtocol.id];
  const post = postKey ? posts[postKey] : undefined;
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
  const posts = getPosts();
  const post = posts.totalLockedValueTvl;
  return (
    <ValueDisplayer
      name={
        <PostLabelHoverCard
          post={post}
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
  const posts = getPosts();
  const post = posts.historicalYield;
  return (
    <ValueDisplayer
      name={
        <PostLabelHoverCard
          post={post}
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
  const posts = getPosts();
  const post = posts.sbtcRewardsMinimumCommitment;
  return (
    <ValueDisplayer
      name={
        <PostLabelHoverCard
          post={post}
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
  const posts = getPosts();
  const post = posts.sbtcRewardsTokens;
  return (
    <ValueDisplayer
      name={
        <PostLabelHoverCard
          post={post}
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
