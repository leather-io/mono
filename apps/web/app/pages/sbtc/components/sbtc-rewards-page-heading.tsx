import { type ReactElement } from 'react';

import { styled } from 'leather-styles/jsx';
import { LearnMoreLink, Page } from '~/layouts/page/page';

export function SbtcRewardsPageHeading(): ReactElement {
  return (
    <Page.Heading
      title="Explore sBTC on Stacks"
      subtitle={
        <>
          Use sBTC in supported DeFi protocols on Stacks. Available strategies, reward assets and
          rates depend on the provider.
          <LearnMoreLink destination="sbtc-rewards" />
          <styled.p textStyle="caption.01" color="ink.text-subdued" mt="space.02" borderRadius="sm">
            Leather does not operate the sBTC bridge or any yield protocols. Users should review
            each app’s documentation before committing assets.
            <br />
            Leather connects you to these providers but does not control how rewards are structured
            or distributed.
          </styled.p>
        </>
      }
    />
  );
}
