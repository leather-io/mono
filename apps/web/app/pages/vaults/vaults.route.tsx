import { MetaDescriptor } from 'react-router';

import { WhenClient } from '~/components/when-client';

import { VaultsPage } from './vaults.page';

export function meta() {
  return [
    { title: 'Vaults – Leather' },
    { name: 'description', content: 'Manage your Leather multisig vaults' },
  ] satisfies MetaDescriptor[];
}

export default function VaultsRoute() {
  return (
    <WhenClient>
      <VaultsPage />
    </WhenClient>
  );
}
