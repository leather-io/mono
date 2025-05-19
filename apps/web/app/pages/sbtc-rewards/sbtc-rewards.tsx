import { ReactElement } from 'react';

import { styled } from 'leather-styles/jsx';
import { AlexLogo } from '~/components/icons/alex-logo';
import { BitflowLogo } from '~/components/icons/bitflow-logo';
import { RotatedArrow } from '~/components/icons/rotated-icon';
import { SbtcLogo } from '~/components/icons/sbtc-logo';
import { VelarLogo } from '~/components/icons/velar-logo';
import { ZestLogo } from '~/components/icons/zest-logo';
import { analytics } from '~/features/analytics/analytics';
import { Page } from '~/features/page/page';
import { PostPageHeading } from '~/components/post-page-heading';
import { SbtcEnrollButton } from '~/features/sbtc-enroll/sbtc-enroll-button';
import { leather } from '~/helpers/leather-sdk';
import { useLeatherConnect } from '~/store/addresses';
import { openExternalLink } from '~/utils/external-links';
import { content } from '~/data/content';
import { formatPostPrompt, formatPostSentence } from '~/utils/post-utils';

import { Button, Hr } from '@leather.io/ui';

import { PostValueHoverCard } from '../../components/post-value-hover-card';
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

const sbtcEnroll = {
  id: 'basic',
  logo: <SbtcLogo size="32px" />,
  title: 'Basic sBTC rewards',
  description: formatPostPrompt(content.posts["sbtc-rewards-basic"]?.Prompt || ''),
  tvl: '2,150 BTC',
  tvlUsd: '$130,050,000',
  minCommitment: '0.005 BTC',
  minCommitmentUsd: '$302.50',
  apr: '4.9%',
  payoutToken: 'sBTC',
} as const;

// Fakes values, to be updated
const pools = [
  {
    id: 'alex',
    url: 'https://app.alexlab.co/pool',
    logo: <AlexLogo size="32px" />,
    title: 'ALEX',
    description:
      'Commit sBTC to liquidity pools to earn fees and LP tokens in addition to basic sBTC rewards',
    tvl: '1,880 BTC',
    tvlUsd: '$113,960,000',
    minCommitment: '0.01 BTC',
    minCommitmentUsd: '$605.00',
    apr: '5.2%',
    payoutToken: 'sBTC',
  } as const,
  {
    id: 'bitflow',
    url: 'https://app.bitflow.finance/sbtc#earn3',
    logo: <BitflowLogo size="32px" />,
    title: 'Bitflow',
    description:
      'Commit sBTC to liquidity pools to earn fees and LP tokens in addition to basic sBTC rewards',
    tvl: '1,420 BTC',
    tvlUsd: '$86,020,000',
    minCommitment: '0.008 BTC',
    minCommitmentUsd: '$484.00',
    apr: '5.1%',
    payoutToken: 'sBTC',
  } as const,
  {
    id: 'velar',
    logo: <VelarLogo size="32px" />,
    url: 'https://app.velar.com/pool',
    title: 'Velar',
    description:
      'Commit sBTC to liquidity pools to earn fees and LP tokens in addition to basic sBTC rewards',
    tvl: '3,100 BTC',
    tvlUsd: '$187,050,000',
    minCommitment: '0.015 BTC',
    minCommitmentUsd: '$907.50',
    apr: '5.0%',
    payoutToken: 'sBTC',
  } as const,
  {
    id: 'zest',
    url: 'https://app.zestprotocol.com',
    logo: <ZestLogo size="32px" />,
    title: 'Zest',
    description:
      'Commit sBTC to liquidity pools to earn fees and LP tokens in addition to basic sBTC rewards',
    tvl: '950 BTC',
    tvlUsd: '$57,950,000',
    minCommitment: '0.007 BTC',
    minCommitmentUsd: '$423.50',
    apr: '5.3%',
    payoutToken: 'sBTC',
  } as const,
] satisfies RewardProtocolInfo[];

export function SbtcRewards() {
  const { status, whenExtensionState } = useLeatherConnect();
  const postSlug = 'sbtc-rewards';

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

        <PostPageHeading post={content.posts[postSlug]} />

        <ApyRewardHeroCard
          apyRange="5–8%"
          mt="space.05"
          backgroundImage="url(/images/sbtc-hero.png)"
          backgroundRepeat="no-repeat"
          backgroundSize="contain"
          backgroundPosition="right"
        />


        <styled.section mt="space.09">
          <PostSectionHeading post={(content.posts as Record<string, any>)['get-sbtc']} prefix="Step 1: " />
          <GetSbtcGrid mt="space.05" />
        </styled.section>

        <styled.section mt="space.08">
          <PostSectionHeading post={(content.posts as Record<string, any>)['sbtc-rewards-provider']} prefix="Step 2: " />

          <SbtcProtocolRewardGrid
            enrollAction={<SbtcEnrollButton />}
            mt="space.05"
            rewardProtocol={sbtcEnroll}
          />

          {pools.map(pool => (
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
