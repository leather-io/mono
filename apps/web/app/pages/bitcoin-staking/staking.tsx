import { styled } from 'leather-styles/jsx';
import { SectionHeading } from '~/components/section-heading';
import { WhenClient } from '~/components/when-client';
import { bitcoinStakingContent } from '~/content/bitcoin-staking-content';
import { learnArticles } from '~/content/learn-content';
import { liquidStackingProvidersList } from '~/data/data';
import { Page } from '~/layouts/page/page';

import { DualStackingTransition } from './components/dual-stacking-transition';
import { LiquidStackingProviderTable } from './components/liquid-stacking-provider-table';
import { StakingExplainer } from './components/staking-explainer';
import { StakingFaq } from './components/staking-faq';
import { StakingProviderTable } from './components/staking-provider-table';
import { StakingScanIndicator } from './components/staking-scan-indicator';
import { StakingTopSection } from './components/staking-top-section';

// ALEX-, LISA-, and Velar-related protocols are deliberately not featured on
// the Bitcoin Staking page; only providers with confirmed pox-5 relevance
// appear in the liquid section.
const liquidProviders = liquidStackingProvidersList.filter(
  provider => provider.providerId !== 'lisa'
);

export function Staking() {
  return (
    <Page>
      <Page.Header title={bitcoinStakingContent.pageTitle}>
        <WhenClient>
          <StakingScanIndicator />
        </WhenClient>
      </Page.Header>

      <WhenClient>
        <StakingTopSection />
      </WhenClient>

      <SectionHeading
        title="Staking pools"
        sentence={bitcoinStakingContent.providerDescription}
        mt="space.09"
      />
      <StakingExplainer mt="space.05" />
      <StakingProviderTable mt="space.05" />

      <SectionHeading
        title={learnArticles.liquidStacking.title}
        sentence={learnArticles.liquidStacking.sentence}
        disclaimer={learnArticles.liquidStacking.disclaimer}
        learnMoreSlug={learnArticles.liquidStacking.slug}
        mt="space.09"
      />
      <LiquidStackingProviderTable mt="space.05" providers={liquidProviders} />

      <DualStackingTransition mt="space.09" />

      <Page.Divider my="space.09" />

      <styled.h2 textStyle="heading.05" mb="space.05">
        Frequently asked questions
      </styled.h2>

      <StakingFaq mb="space.04" />

      <styled.a
        href={bitcoinStakingContent.learnMore.url}
        target="_blank"
        rel="noopener noreferrer"
        textStyle="label.02"
        color="ink.text-subdued"
        textDecoration="underline"
        mb="space.07"
      >
        {bitcoinStakingContent.learnMore.label}
      </styled.a>
    </Page>
  );
}
