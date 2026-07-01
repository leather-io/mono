import { WhenClient } from '~/components/when-client';

import { ContextPreviewPage } from './context-preview.page';

export default function ContextPreviewRoute() {
  return (
    <WhenClient>
      <ContextPreviewPage />
    </WhenClient>
  );
}
