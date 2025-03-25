import { styled } from 'leather-styles/jsx';
import { Page } from '~/components/page';

import { EarnProviderTable, LiquidStackingProviderTable } from './components/earn-provider-table';
import { LiquidStackingExplainer } from './components/liquid-stacking-explainer';
import { StackingExplainer } from './components/stacking-explainer';

export function Earn() {
  return (
    <Page>
      <Page.Header title="Invest in Stacks" />

      <styled.h2 textStyle="heading.05" mt="space.07">
        Stack in a pool
      </styled.h2>

      <StackingExplainer mt="space.04" />

      <EarnProviderTable mt="space.05" />

      <styled.h2 textStyle="heading.05" mt="space.09">
        Liquid stacking
      </styled.h2>

      <LiquidStackingExplainer mt="space.04" />

      <LiquidStackingProviderTable mt="space.05" />

      <Page.Divider my="space.07" />
    </Page>
  );
}
