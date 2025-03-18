import { styled } from 'leather-styles/jsx';
import { Page } from '~/components/page';

import { EarnInstructions } from './components/earn-instructions';
import { EarnProviderTable } from './components/earn-provider-table';

export function Earn() {
  return (
    <Page>
      <Page.Header title="Earn" />

      <styled.h2 textStyle="heading.05" mt="space.07">
        Stack in a pool
      </styled.h2>

      <EarnInstructions mt="space.03" />

      <EarnProviderTable mt="space.05" />

      <styled.div
        mt="space.07"
        w="100%"
        height="300px"
        background="ink.border-default"
        borderRadius="lg"
      />
      <styled.h2 textStyle="heading.05" mt="space.05">
        Liquid stacking
      </styled.h2>
      <styled.p textStyle="caption.01" mt="space.02">
        Stack while keeping your STX liquid
      </styled.p>
      <styled.div
        my="space.07"
        w="100%"
        height="300px"
        background="ink.border-default"
        borderRadius="lg"
      />
    </Page>
  );
}
