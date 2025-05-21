import { ReactElement } from 'react';

import { styled } from 'leather-styles/jsx';
import { ApyRewardHeroCard } from '~/components/apy-hero-card';
import { AlexLogo } from '~/components/icons/alex-logo';
import { BitflowLogo } from '~/components/icons/bitflow-logo';
import { RotatedArrow } from '~/components/icons/rotated-icon';
import { SbtcLogo } from '~/components/icons/sbtc-logo';
import { VelarLogo } from '~/components/icons/velar-logo';
import { ZestLogo } from '~/components/icons/zest-logo';
import { PostPageHeading } from '~/components/post-page-heading';
import { PostSectionHeading } from '~/components/post-section-heading';
import { content } from '~/data/content';
import { sbtcEnroll as sbtcEnrollData, sbtcPools } from '~/data/data';
import { analytics } from '~/features/analytics/analytics';
import { Page } from '~/features/page/page';
import { SbtcEnrollButton } from '~/features/sbtc-enroll/sbtc-enroll-button';
import { leather } from '~/helpers/leather-sdk';
import { useRemainingSbtcSupply } from '~/queries/sbtc/use-remaining-sbtc-supply';
import { useLeatherConnect } from '~/store/addresses';
import { openExternalLink } from '~/utils/external-links';
import { formatPostPrompt, getPosts } from '~/utils/post-utils';

import { Button, Hr } from '@leather.io/ui';

import { GetSbtcGrid } from './components/get-sbtc-grid';
import { SbtcProtocolRewardGrid } from './components/sbtc-protocol-reward-grid';
import { SbtcRewardsFaq } from './components/sbtc-rewards-faq';
import { SbtcRewardContext } from './sbtc-rewards-context';

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
  payoutToken: string | string[];
}

const posts = getPosts();

const sbtcEnroll = {
  id: sbtcEnrollData.id,
  logo: <SbtcLogo size="32px" />,
  title: sbtcEnrollData.title,
  description: formatPostPrompt(posts.sbtcRewardsBasic?.prompt || ''),
  tvl: sbtcEnrollData.tvl,
  tvlUsd: sbtcEnrollData.tvlUsd,
  minCommitment: sbtcEnrollData.minCommitment,
  minCommitmentUsd: sbtcEnrollData.minCommitmentUsd,
  apr: sbtcEnrollData.apr,
  payoutToken: sbtcEnrollData.payoutToken,
} as const;

const logoMap: Record<string, ReactElement> = {
  alex: <AlexLogo size="32px" />,
  bitflow: <BitflowLogo size="32px" />,
  velar: <VelarLogo size="32px" />,
  zest: <ZestLogo size="32px" />,
};

// Map the data from sbtcPools to the format expected by SbtcProtocolRewardGrid
const formattedSbtcPools = sbtcPools.map(pool => ({
  id: pool.id,
  logo: logoMap[pool.id] || null,
  title: pool.title,
  description: pool.description,
  tvl: pool.tvl,
  tvlUsd: pool.tvlUsd,
  minCommitment: pool.minCommitment,
  minCommitmentUsd: pool.minCommitmentUsd,
  apr: pool.apr,
  payoutToken: pool.payoutToken,
  url: pool.url,
}));

export function SbtcRewards(): ReactElement {
  const { status, whenExtensionState } = useLeatherConnect();
  const postSlug = 'sbtcRewards';
  const remainingSbtcPegCapSupply = useRemainingSbtcSupply();

  async function bridgeSbtc() {
    void analytics.untypedTrack('bridge_btc_sbtc_opened');
    await leather.openSwap({ base: 'BTC', quote: 'sBTC' });
  }

  async function swapStxSbtc() {
    void analytics.untypedTrack('swap_stx_sbtc_opened');
    await leather.openSwap({ base: 'STX', quote: 'sBTC' });
  }

  return (
    <SbtcRewardContext.Provider
      value={{
        whenExtensionState,
        bridgingStatus: remainingSbtcPegCapSupply?.isGreaterThan(0) ? 'enabled' : 'disabled',
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

          {formattedSbtcPools.map(pool => (
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
