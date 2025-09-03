import { ReactElement } from 'react';
import { useLoaderData } from 'react-router';

import { styled } from 'leather-styles/jsx';
import { ApyRewardHeroCard } from '~/components/apy-hero-card';
import { RotatedArrow } from '~/components/icons/rotated-icon';
import { PostSectionHeading } from '~/components/posts/post-section-heading';
import { content } from '~/data/content';
import { SbtcEnrollButton } from '~/features/sbtc-enroll/sbtc-enroll-button';
import { Page } from '~/layouts/page/page';
import { SbtcRewardsPageHeading } from '~/pages/sbtc-rewards/components/sbtc-rewards-page-heading';
import { loader } from '~/pages/sbtc-rewards/sbtc.route';
import { useRemainingSbtcSupply } from '~/queries/sbtc/use-remaining-sbtc-supply';
import { useLeatherConnect } from '~/store/addresses';
import { analytics } from '~/utils/analytics/analytics';
import { openExternalLink } from '~/utils/external-links';
import { leather } from '~/utils/leather-sdk';
import { getPosts } from '~/utils/post-utils';

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

export function SbtcRewards(): ReactElement {
  const { sbtcPools, sbtcEnroll } = useLoaderData<typeof loader>();
  const { status, whenExtensionState } = useLeatherConnect();
  const remainingSbtcPegCapSupply = useRemainingSbtcSupply();

  async function bridgeSbtc() {
    analytics.untypedTrack('bridge_btc_sbtc_opened');
    await leather.openSwap({ base: 'BTC', quote: 'sBTC' });
  }

  async function swapStxSbtc() {
    analytics.untypedTrack('swap_stx_sbtc_opened');
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

        <SbtcRewardsPageHeading />

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

          {sbtcEnroll && (
            <SbtcProtocolRewardGrid
              enrollAction={<SbtcEnrollButton />}
              mt="space.05"
              rewardProtocol={sbtcEnroll}
            />
          )}

          {sbtcPools.map(pool => (
            <SbtcProtocolRewardGrid
              enrollAction={
                <Button size="sm" fullWidth onClick={() => openExternalLink(pool.url)}>
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
