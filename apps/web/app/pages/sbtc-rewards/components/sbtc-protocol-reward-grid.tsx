import { ReactElement } from 'react';

import { Box, Flex, GridProps, styled } from 'leather-styles/jsx';
import { SbtcLogo } from '~/components/icons/sbtc-logo';
import { PostLabelHoverCard } from '~/components/post-label-hover-card';
import { ValueDisplayer } from '~/components/value-displayer/default-value-displayer';
import { RewardProtocolInfo } from '~/data/data';
import { LearnMoreLink } from '~/features/page/page';
import { getPosts } from '~/utils/post-utils';

import { Flag } from '@leather.io/ui';
import { ensureArray } from '@leather.io/utils';

import { SbtcProtocolRewardGridLayout } from './sbtc-protocol-reward-grid.layout';
import { SbtcProviderIcon } from './sbtc-provider-icon';

interface RewardProtocolCellProps {
  rewardProtocol: RewardProtocolInfo;
}

function RewardProtocolEnrollCell({
  rewardProtocol,
  action,
}: RewardProtocolCellProps & { action: React.ReactElement }): ReactElement {
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
      {<SbtcProviderIcon id={rewardProtocol.id} />}
      <Box>
        <styled.h3 textStyle="heading.05" mt="space.05">
          {rewardProtocol.title}
        </styled.h3>
        {post && (
          <styled.div textStyle="caption.01" mt="space.01">
            {post.prompt}
            <LearnMoreLink destination={post.slug} precedingText={post.prompt} />
          </styled.div>
        )}
        {!post && (
          <styled.div textStyle="caption.01" mt="space.01">
            {rewardProtocol.description}
          </styled.div>
        )}
        <Box mt="space.04">{action}</Box>
      </Box>
    </Flex>
  );
}

function TotalValueLockedCell({ rewardProtocol }: RewardProtocolCellProps): ReactElement {
  const posts = getPosts();
  const post = posts.totalLockedValueTvl;
  return (
    <ValueDisplayer
      name={
        <PostLabelHoverCard post={post} label="Total Value Locked (TVL)" textStyle="label.03" />
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

function HistoricalAprCell({ rewardProtocol }: RewardProtocolCellProps): ReactElement {
  const posts = getPosts();
  const post = posts.historicalYield;
  return (
    <ValueDisplayer
      name={<PostLabelHoverCard post={post} label="Historical yield" textStyle="label.03" />}
      value={rewardProtocol.apr}
      textAlign="left"
    />
  );
}

function MinimumCommitmentCell({ rewardProtocol }: RewardProtocolCellProps): ReactElement {
  const posts = getPosts();
  const post = posts.sbtcRewardsMinimumCommitment;
  return (
    <ValueDisplayer
      name={<PostLabelHoverCard post={post} label="Minimum commitment" textStyle="label.03" />}
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

function PayoutTokenCell({ rewardProtocol }: RewardProtocolCellProps): ReactElement {
  const posts = getPosts();
  const post = posts.sbtcRewardsTokens;
  const payoutTokens = ensureArray(rewardProtocol.payoutToken);

  return (
    <ValueDisplayer
      name={<PostLabelHoverCard post={post} label="Rewards token" textStyle="label.03" />}
      value={
        <Flex gap="space.02">
          {payoutTokens.map(token =>
            token === 'sBTC' ? (
              <Flag key={token} spacing="space.02" img={<SbtcLogo size={24} />}>
                {token}
              </Flag>
            ) : (
              <Box key={token}>{token}</Box>
            )
          )}
        </Flex>
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
}: SbtcProtocolRewardGridProps): ReactElement {
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
