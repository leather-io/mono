import { WhenClient } from '~/components/when-client';

import { SidebarPreviewPage } from './sidebar-preview.page';

export default function SidebarPreviewRoute() {
  return (
    <WhenClient>
      <SidebarPreviewPage />
    </WhenClient>
  );
}
