import { styled } from 'leather-styles/jsx';
import { ApyRewardHeroCard } from '~/components/apy-hero-card';
import { StacksAccountLoader } from '~/components/stacks-account-loader';
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

      <Page.Heading
        title="Earn yield from stacking on Stacks"
        subtitle="Earn yield from the native consensus mechanism of Stacks—the leading L2 for Bitcoin—by either locking your STX via a pool or converting your STX to a liquid Stacking token."
      />

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

      <Page.Title mt="space.09">Pooled stacking</Page.Title>
      <StackingExplainer mt="space.05" />

      <StackingProviderTable mt="space.05" />

      <IndependentStackingLink />

      <Page.Title mt="space.09">Liquid stacking</Page.Title>

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
