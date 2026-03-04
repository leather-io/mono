import { ReactElement } from 'react';

import { styled } from 'leather-styles/jsx';
import { LearnMoreLink, Page } from '~/layouts/page/page';

export function SbtcRewardsPageHeading(): ReactElement {
  return (
    <Page.Heading
      title="Earn yield with Bitcoin on Stacks"
      subtitle={
        <>
          sBTC rewards are earned when users mint sBTC by locking BTC and use it in DeFi protocols
          that offer yield in BTC or other tokens.
          <LearnMoreLink destination="sbtc-rewards" />
          <styled.p
            textStyle="caption.01"
            color="ink.text-subdued-secondary"
            mt="space.02"
            borderRadius="sm"
          >
            Leather does not operate the sBTC bridge or any yield protocols. Users should review
            each app’s documentation before committing assets.
            <br />
            Leather gives you secure access to these opportunities but does not control how rewards
            are structured or distributed.
          </styled.p>
        </>
      }
    />
  );
}
