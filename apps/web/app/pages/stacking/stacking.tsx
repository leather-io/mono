import { styled } from 'leather-styles/jsx';
import { PostValueHoverCard } from '~/components/post-value-hover-card';
import { StacksAccountLoader } from '~/components/stacks-account-loader';
import { Page } from '~/features/page/page';
import { PostPageHeading } from '~/components/post-page-heading';
import { content } from '~/data/content';
import { UserPositions } from '~/features/stacking/user-positions';
import { PostSectionHeading } from '~/components/post-section-heading';

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

      <Page.Inset pos="relative" bg="black" color="white" h="260px" backgroundImage="url('/images/orange-stacks-coins.webp')" backgroundRepeat="no-repeat" bgPosition="right">
        <styled.div style={{ position: 'absolute', bottom: 0, width: '100%' }} p={['space.04', 'space.05', 'space.07']}>
          <PostValueHoverCard postKey="historical-yield" value="6–10%" />
        </styled.div>
      </Page.Inset>

      <StacksAccountLoader>
        {stacksAccount => <UserPositions stacksAddress={stacksAccount.address} />}
      </StacksAccountLoader>

      <PostSectionHeading post={content.posts['pooled-stacking']} />
      <StackingExplainer mt="space.05" />

      <StackingProviderTable mt="space.05" />


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
