import { type MetaDescriptor } from 'react-router';

import { WhenClient } from '~/components/when-client';

import { VaultDetailPage } from './vault.page';

export function meta() {
  return [{ title: 'Vault – Leather Multisig' }] satisfies MetaDescriptor[];
}

export default function VaultRoute() {
  return (
    <WhenClient>
      <VaultDetailPage />
    </WhenClient>
  );
}
