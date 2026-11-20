import { WhenClient } from '~/components/when-client';

import { ComplianceStatesPage } from './compliance-states.page';

export default function ComplianceStatesRoute() {
  return (
    <WhenClient>
      <ComplianceStatesPage />
    </WhenClient>
  );
}
