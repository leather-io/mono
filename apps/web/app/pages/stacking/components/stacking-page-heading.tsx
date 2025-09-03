import { ReactElement } from 'react';

import { styled } from 'leather-styles/jsx';
import { LearnMoreLink, Page } from '~/layouts/page/page';

export function StackingPageHeading(): ReactElement {
  return (
    <Page.Heading
      title="Earn Bitcoin yield with your STX"
      subtitle={
        <>
          Stacking is the process of locking your STX to earn Bitcoin rewards by supporting the
          Stacks blockchain, either through pooled participation or flexible, DeFi-enabled liquid
          Stacking.
          <LearnMoreLink destination="stacking" />
          <styled.p textStyle="caption.01" color="ink.text-subdued" mt="space.02" borderRadius="sm">
            Leather does not operate or manage any Stacking pools or liquid Stacking protocols.
            Users are responsible for evaluating the risks, terms, and smart contracts involved in
            any third-party options they access through Leather.
          </styled.p>
        </>
      }
    />
  );
}
