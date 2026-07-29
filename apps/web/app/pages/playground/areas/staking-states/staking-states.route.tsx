import { WhenClient } from '~/components/when-client';

import { StakingStatesPage } from './staking-states.page';

export default function StakingStatesRoute() {
  return (
    <WhenClient>
      <StakingStatesPage />
    </WhenClient>
  );
}
