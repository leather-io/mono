import { WhenClient } from '~/components/when-client';

import { ComplianceUiPage } from './compliance-ui.page';

export default function ComplianceUiRoute() {
  return (
    <WhenClient>
      <ComplianceUiPage />
    </WhenClient>
  );
}
