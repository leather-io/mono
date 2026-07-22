import { styled } from 'leather-styles/jsx';
import { ApyRewardHeroCard } from '~/components/apy-hero-card';
import { SectionHeading } from '~/components/section-heading';
import { StacksAccountLoader } from '~/components/stacks-account-loader';
import { bitcoinStakingContent } from '~/content/bitcoin-staking-content';
import { learnArticles } from '~/content/learn-content';
import { liquidStackingProvidersList } from '~/data/data';
import { Page } from '~/layouts/page/page';
import { LiquidStackingProviderTable } from '~/pages/stacking/components/stacking-provider-table';

import { StakingExplainer } from './components/staking-explainer';
import { StakingFaq } from './components/staking-faq';
import { StakingProviderTable } from './components/staking-provider-table';
import { StakingUserPosition } from './components/staking-user-position';

// ALEX-, LISA-, and Velar-related protocols are deliberately not featured on
// the Bitcoin Staking page; only providers with confirmed pox-5 relevance
// appear in the liquid section.
const liquidProviders = liquidStackingProvidersList.filter(
  provider => provider.providerId !== 'lisa'
);

export function Staking() {
  return (
    <Page>
      <Page.Header title={bitcoinStakingContent.pageTitle} />

      <Page.Heading
        title="Earn Bitcoin yield with your STX"
        subtitle={
          <>
            {bitcoinStakingContent.pageSubtitle}
            <styled.p
              textStyle="caption.01"
              color="ink.text-subdued"
              mt="space.02"
              borderRadius="sm"
            >
              Leather does not operate or manage any staking pools. Users are responsible for
              evaluating the risks, terms, and smart contracts involved in any third-party options
              they access through Leather.
            </styled.p>
          </>
        }
      />

      <ApyRewardHeroCard
        apyRange={bitcoinStakingContent.heroYieldLabel}
        backgroundImage="url(/images/stacking-hero.png)"
        backgroundRepeat="no-repeat"
        backgroundSize="contain"
        backgroundPosition="right"
      />

      <StacksAccountLoader>{() => <StakingUserPosition />}</StacksAccountLoader>

      <SectionHeading title="Staking pools" sentence={bitcoinStakingContent.providerDescription} />
      <StakingExplainer mt="space.05" />
      <StakingProviderTable mt="space.05" />

      <SectionHeading
        title={learnArticles.liquidStacking.title}
        sentence={learnArticles.liquidStacking.sentence}
        disclaimer={learnArticles.liquidStacking.disclaimer}
        learnMoreSlug={learnArticles.liquidStacking.slug}
      />
      <LiquidStackingProviderTable mt="space.05" providers={liquidProviders} />

      <Page.Divider my="space.07" />

      <styled.h2 textStyle="heading.05" mb="space.05">
        Frequently asked questions
      </styled.h2>

      <StakingFaq mb="space.07" />
    </Page>
  );
}
