import { WhenClient } from '~/components/when-client';

import { PagesPreviewPage } from './pages-preview.page';

export default function PagesPreviewRoute() {
  return (
    <WhenClient>
      <PagesPreviewPage />
    </WhenClient>
  );
}
