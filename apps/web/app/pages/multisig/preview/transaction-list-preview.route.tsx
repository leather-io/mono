import { WhenClient } from '~/components/when-client';

import { TransactionListPreviewPage } from './transaction-list-preview.page';

export default function TransactionListPreviewRoute() {
  return (
    <WhenClient>
      <TransactionListPreviewPage />
    </WhenClient>
  );
}
