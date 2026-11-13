import { WhenClient } from '~/components/when-client';

import { ApprovalFlowsPage } from './approval-flows.page';

export default function ApprovalFlowsRoute() {
  return (
    <WhenClient>
      <ApprovalFlowsPage />
    </WhenClient>
  );
}
