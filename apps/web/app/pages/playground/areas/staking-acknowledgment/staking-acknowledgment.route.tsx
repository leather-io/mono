import { WhenClient } from '~/components/when-client';

import { StakingAcknowledgmentPage } from './staking-acknowledgment.page';

export default function StakingAcknowledgmentRoute() {
  return (
    <WhenClient>
      <StakingAcknowledgmentPage />
    </WhenClient>
  );
}
