import { styled } from 'leather-styles/jsx';
import { RotatedArrow } from '~/components/icons/rotated-icon';
import { sbtcEnroll, sbtcPools } from '~/data/data';
import { analytics } from '~/features/analytics/analytics';
import { Page } from '~/features/page/page';
import { SbtcEnrollButton } from '~/features/sbtc-enroll/sbtc-enroll-button';
import { leather } from '~/helpers/leather-sdk';
import { useLeatherConnect } from '~/store/addresses';
import { openExternalLink } from '~/utils/external-links';

import { Button, Hr } from '@leather.io/ui';

import { ApyRewardHeroCard } from '../../components/apy-hero-card';
import { GetSbtcGrid } from './components/get-sbtc-grid';
import { SbtcProtocolRewardGrid } from './components/sbtc-protocol-reward-grid';
import { SbtcRewardsFaq } from './components/sbtc-rewards-faq';
import { SbtcRewardContext } from './sbtc-rewards-context';

export function SbtcRewards() {
  const { status, whenExtensionState } = useLeatherConnect();

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

        <Page.Heading
          title="Earn yield with Bitcoin on Stacks"
          subtitle="Get BTC in the form of sBTC on Stacks—the leading L2 for Bitcoin—to earn yield from a variety of reward protocols without sacrificing Bitcoin’s underlying security and self-sovereignty."
        />

        <ApyRewardHeroCard apyRange="5–8%" mt="space.05" />

        <styled.section mt="space.09">
          <styled.h3 textStyle="heading.03">Step 1: Get sBTC</styled.h3>
          <styled.p textStyle="label.03" mt="space.02" maxW="390px">
            You can get sBTC either by bridging BTC to the Stacks blockchain or by swapping another
            asset on Stacks on the L2 itself.
          </styled.p>
          <GetSbtcGrid mt="space.05" />
        </styled.section>

        <styled.section mt="space.08">
          <styled.h3 textStyle="heading.03">Step 2: Choose reward protocol</styled.h3>

          <SbtcProtocolRewardGrid
            enrollAction={<SbtcEnrollButton />}
            mt="space.05"
            rewardProtocol={sbtcEnroll}
          />

          {sbtcPools.map(pool => (
            <SbtcProtocolRewardGrid
              enrollAction={
                <Button size="xs" fullWidth onClick={() => openExternalLink(pool.url)}>
                  Explore <RotatedArrow />
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
