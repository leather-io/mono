import { WhenClient } from '~/components/when-client';

import { SbtcSponsorshipFlowsPage } from './sbtc-sponsorship-flows.page';

export default function SbtcSponsorshipFlowsRoute() {
  return (
    <WhenClient>
      <SbtcSponsorshipFlowsPage />
    </WhenClient>
  );
}
