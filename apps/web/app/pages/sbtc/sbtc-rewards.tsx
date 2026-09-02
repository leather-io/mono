import { ReactElement } from 'react';
import { useLoaderData } from 'react-router';

import { styled } from 'leather-styles/jsx';
import { ApyRewardHeroCard } from '~/components/apy-hero-card';
import { BasicPageSectionHeading } from '~/components/basic-page/basic-page-section-heading';
import { RotatedArrow } from '~/components/icons/rotated-icon';
import { Page } from '~/layouts/page/page';
import { SbtcRewardsPageHeading } from '~/pages/sbtc/components/sbtc-rewards-page-heading';
import { loader } from '~/pages/sbtc/sbtc.route';
import { useLeatherConnect } from '~/store/addresses';
import { analytics } from '~/utils/analytics/analytics';
import { openExternalLink } from '~/utils/external-links';
import { leather } from '~/utils/leather-sdk';

import { Button, Hr } from '@leather.io/ui';

import { GetSbtcGrid } from './components/get-sbtc-grid';
import { SbtcProtocolRewardGrid } from './components/sbtc-protocol-reward-grid';
import { SbtcRewardsFaq } from './components/sbtc-rewards-faq';
import { SbtcRewardsSunsetCallout } from './components/sbtc-rewards-sunset-callout';
import { SbtcRewardContext } from './sbtc-rewards-context';

export function SbtcRewards(): ReactElement {
  const { sbtcPools } = useLoaderData<typeof loader>();
  const { status, whenExtensionState } = useLeatherConnect();

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
          <BasicPageSectionHeading
            prefix="Step 1: "
            title="Get sBTC"
            description="Get sBTC by bridging BTC or swapping other Stacks assets like STX through integrated DeFi protocols."
            slug="get-sbtc"
            disclaimer="Leather does not operate the sBTC bridge or token swap protocols. Users are responsible for reviewing all terms, pricing, and risks before initiating any transactions."
          />
          <GetSbtcGrid mt="space.05" />
        </styled.section>

        <styled.section mt="space.08">
          <BasicPageSectionHeading
            prefix="Step 2: "
            title="Choose sBTC rewards provider"
            description="An sBTC rewards provider is any DeFi protocol that lets users earn yield by deploying sBTC in supported strategies."
            slug="sbtc-rewards-provider"
            disclaimer="sBTC rewards providers are independent third-party protocols. Leather does not control their reward logic or smart contracts. Users should review platform-specific documentation before committing sBTC."
          />

          <SbtcRewardsSunsetCallout mt="space.05" />

          {sbtcPools.map(pool => (
            <SbtcProtocolRewardGrid
              enrollAction={
                <Button size="sm" fullWidth onClick={() => openExternalLink(pool.url)}>
                  Start earning <RotatedArrow />
                </Button>
              }
              key={pool.id}
              mt="space.06"
              pool={pool}
            />
          ))}
        </styled.section>

        <Hr my="space.09" />

        <styled.h2 textStyle="heading.05" mb="space.05">
          Frequently asked questions
        </styled.h2>

        <SbtcRewardsFaq />
      </Page>
    </SbtcRewardContext.Provider>
  );
}
