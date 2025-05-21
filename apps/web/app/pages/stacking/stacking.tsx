import { styled } from 'leather-styles/jsx';
import { ApyRewardHeroCard } from '~/components/apy-hero-card';
import { PostPageHeading } from '~/components/post-page-heading';
import { PostSectionHeading } from '~/components/post-section-heading';
import { StacksAccountLoader } from '~/components/stacks-account-loader';
import { content } from '~/data/content';
import { Page } from '~/features/page/page';
import { UserPositions } from '~/features/stacking/user-positions/user-positions';

import { IndependentStackingLink } from './components/independent-stacking-link';
import { LiquidStackingExplainer } from './components/liquid-stacking-explainer';
import { StackingExplainer } from './components/stacking-explainer';
import { StackingFaq } from './components/stacking-faq';
import {
  LiquidStackingProviderTable,
  StackingProviderTable,
} from './components/stacking-provider-table';

export function Stacking() {
  return (
    <Page>
      <Page.Header title="Stacking" />

      <PostPageHeading post={content.posts['stacking']} />

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

      <PostSectionHeading post={content.posts['pooled-stacking']} />
      <StackingExplainer mt="space.05" />
      <StackingProviderTable mt="space.05" />
      <IndependentStackingLink />
      <PostSectionHeading post={content.posts['liquid-stacking']} />
      <LiquidStackingExplainer mt="space.04" />
      <LiquidStackingProviderTable mt="space.05" />

      <Page.Divider my="space.07" />

      <styled.h2 textStyle="heading.05" mb="space.05">
        Frequently asked questions
      </styled.h2>

      <StackingFaq mb="space.07" />
    </Page>
  );
}
