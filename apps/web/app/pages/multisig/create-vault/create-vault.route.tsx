import { type MetaDescriptor } from 'react-router';

import { WhenClient } from '~/components/when-client';

import { CreateVaultPage } from './create-vault.page';

export function meta() {
  return [{ title: 'Create vault – Leather Multisig' }] satisfies MetaDescriptor[];
}

export default function CreateVaultRoute() {
  return (
    <WhenClient>
      <CreateVaultPage />
    </WhenClient>
  );
}
