import { WhenClient } from '~/components/when-client';

import { GalleryPreviewPage } from './gallery-preview.page';

export default function GalleryPreviewRoute() {
  return (
    <WhenClient>
      <GalleryPreviewPage />
    </WhenClient>
  );
}
