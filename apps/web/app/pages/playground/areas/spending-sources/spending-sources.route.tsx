import { WhenClient } from '~/components/when-client';

import { SpendingSourcesPage } from './spending-sources.page';

export default function SpendingSourcesRoute() {
  return (
    <WhenClient>
      <SpendingSourcesPage />
    </WhenClient>
  );
}
