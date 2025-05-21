import { ReactElement } from 'react';

import { styled } from 'leather-styles/jsx';
import { RotatedArrow } from '~/components/icons/rotated-icon';
import { SbtcLogo } from '~/components/icons/sbtc-logo';
import { AlexLogo } from '~/components/icons/alex-logo';
import { BitflowLogo } from '~/components/icons/bitflow-logo';
import { VelarLogo } from '~/components/icons/velar-logo';
import { ZestLogo } from '~/components/icons/zest-logo';
import { sbtcEnroll as originalSbtcEnroll, sbtcPools as originalSbtcPools } from '~/data/data';
import { analytics } from '~/features/analytics/analytics';
import { Page } from '~/features/page/page';
import { PostPageHeading } from '~/components/post-page-heading';
import { SbtcEnrollButton } from '~/features/sbtc-enroll/sbtc-enroll-button';
import { leather } from '~/helpers/leather-sdk';
import { useLeatherConnect } from '~/store/addresses';
import { openExternalLink } from '~/utils/external-links';
import { content } from '~/data/content';
import { formatPostPrompt, getPosts } from '~/utils/post-utils';
import { ApyRewardHeroCard } from '~/components/apy-hero-card';

import { Button, Hr } from '@leather.io/ui';

import { GetSbtcGrid } from './components/get-sbtc-grid';
import { SbtcProtocolRewardGrid } from './components/sbtc-protocol-reward-grid';
import { SbtcRewardsFaq } from './components/sbtc-rewards-faq';
import { SbtcRewardContext } from './sbtc-rewards-context';
import { PostSectionHeading } from '~/components/post-section-heading';

export interface RewardProtocolInfo {
  id: string;
  url?: string;
  logo: ReactElement;
  title: string;
  description: string;
  tvl: string;
  tvlUsd: string;
  minCommitment: string;
  minCommitmentUsd: string;
  apr: string;
  payoutToken: string;
}

const posts = getPosts();

const sbtcEnroll = {
  id: 'basic',
  logo: <SbtcLogo size="32px" />,
  title: 'Basic sBTC rewards',
  description: formatPostPrompt(posts.sbtcRewardsBasic?.prompt || ''),
  tvl: '2,150 BTC',
  tvlUsd: '$130,050,000',
  minCommitment: '0.005 BTC',
  minCommitmentUsd: '$302.50',
  apr: '4.9%',
  payoutToken: 'sBTC',
} as const;

const logoMap: Record<string, ReactElement> = {
  AlexLogo: <AlexLogo size="32px" />,
  BitflowLogo: <BitflowLogo size="32px" />,
  VelarLogo: <VelarLogo size="32px" />,
  ZestLogo: <ZestLogo size="32px" />,
};
const sbtcPools = content.sbtcPools.map(pool => ({
  ...pool,
  logo: logoMap[pool.logoKey] || null,
}));

export function SbtcRewards() {
  const { status, whenExtensionState } = useLeatherConnect();
  const postSlug = 'sbtcRewards';

  function bridgeSbtc() {
    // Cannot bridge, cap reached
  }

  async function swapStxSbtc() {
    void analytics.untypedTrack('swap_stx_sbtc_opened');
    await leather.openSwap({ base: 'STX', quote: 'sBTC' });
  }

  return (
    <SbtcRewardContext.Provider
      value={{
        whenExtensionState,
        bridgingStatus: 'disabled',
        extensionStatus: status,
        onBridgeSbtc: bridgeSbtc,
        onSwapStxSbtc: swapStxSbtc,
      }}
    >
      <Page>
        <Page.Header title="sBTC Rewards" />

        <PostPageHeading post={posts[postSlug]} />

        <ApyRewardHeroCard
          apyRange="5–8%"
          mt="space.05"
          backgroundImage="url(/images/sbtc-hero.png)"
          backgroundRepeat="no-repeat"
          backgroundSize="contain"
          backgroundPosition="right"
        />


        <styled.section mt="space.09">
          <PostSectionHeading post={posts.getSbtc} prefix="Step 1: " />
          <GetSbtcGrid mt="space.05" />
        </styled.section>

        <styled.section mt="space.08">
          <PostSectionHeading post={posts.sbtcRewardsProvider} prefix="Step 2: " />

          <SbtcProtocolRewardGrid
            enrollAction={<SbtcEnrollButton />}
            mt="space.05"
            rewardProtocol={sbtcEnroll}
          />

          {sbtcPools.map(pool => (
            <SbtcProtocolRewardGrid
              enrollAction={
                <Button size="xs" fullWidth onClick={() => openExternalLink(pool.url)}>
                  {content.labels.startEarning} <RotatedArrow />
                </Button>
              }
              key={pool.id}
              mt="space.06"
              rewardProtocol={pool}
            />
          ))}
        </styled.section>

        <Page.Inset>
          <Hr my="space.09" />
        </Page.Inset>

        <styled.h2 textStyle="heading.05" mb="space.05">
          Frequently asked questions
        </styled.h2>

        <SbtcRewardsFaq mb="space.07" />
      </Page>
    </SbtcRewardContext.Provider>
  );
}
