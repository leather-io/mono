import { styled } from 'leather-styles/jsx';
import { ApyRewardHeroCard } from '~/components/apy-hero-card';
import { SectionHeading } from '~/components/section-heading';
import { StacksAccountLoader } from '~/components/stacks-account-loader';
import { learnArticles } from '~/content/learn-content';
import { UserPositions } from '~/features/stacking/user-positions/user-positions';
import { Page } from '~/layouts/page/page';

import { DualStackingPromo } from './components/dual-stacking-promo';
import { IndependentStackingLink } from './components/independent-stacking-link';
import { LiquidStackingExplainer } from './components/liquid-stacking-explainer';
import { StackingExplainer } from './components/stacking-explainer';
import { StackingFaq } from './components/stacking-faq';
import { StackingPageHeading } from './components/stacking-page-heading';
import {
  LiquidStackingProviderTable,
  StackingProviderTable,
} from './components/stacking-provider-table';

export function Stacking() {
  return (
    <Page>
      <Page.Header title="Stacking" />

      <StackingPageHeading />

      <ApyRewardHeroCard
        apyRange="6–10%"
        backgroundImage="url(/images/stacking-hero.png)"
        backgroundRepeat="no-repeat"
        backgroundSize="contain"
        backgroundPosition="right"
      />

      <StacksAccountLoader>
        {stacksAccount => <UserPositions stacksAddress={stacksAccount.address} />}
      </StacksAccountLoader>

      <SectionHeading
        title={learnArticles.pooledStacking.title}
        sentence={learnArticles.pooledStacking.sentence}
        disclaimer={learnArticles.pooledStacking.disclaimer}
        learnMoreSlug={learnArticles.pooledStacking.slug}
      />
      <StackingExplainer mt="space.05" />
      <StackingProviderTable mt="space.05" />
      <IndependentStackingLink />
      <SectionHeading
        title={learnArticles.liquidStacking.title}
        sentence={learnArticles.liquidStacking.sentence}
        disclaimer={learnArticles.liquidStacking.disclaimer}
        learnMoreSlug={learnArticles.liquidStacking.slug}
      />
      <LiquidStackingExplainer mt="space.04" />
      <LiquidStackingProviderTable mt="space.05" />

      <SectionHeading title="Dual stacking" />
      <DualStackingPromo />

      <Page.Divider my="space.07" />

      <styled.h2 textStyle="heading.05" mb="space.05">
        Frequently asked questions
      </styled.h2>

      <StackingFaq mb="space.07" />
    </Page>
  );
}
