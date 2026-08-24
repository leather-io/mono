import { WhenClient } from '~/components/when-client';

import { ExtensionApprovalScreensPage } from './extension-approval-screens.page';

export default function ExtensionApprovalScreensRoute() {
  return (
    <WhenClient>
      <ExtensionApprovalScreensPage />
    </WhenClient>
  );
}
