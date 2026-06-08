import { type MetaDescriptor } from 'react-router';

import { WhenClient } from '~/components/when-client';

import { TxDetailPage } from './tx.page';

export function meta() {
  return [{ title: 'Transaction – Leather Multisig' }] satisfies MetaDescriptor[];
}

export default function TxRoute() {
  return (
    <WhenClient>
      <TxDetailPage />
    </WhenClient>
  );
}
