import { type MetaDescriptor } from 'react-router';

import { WhenClient } from '~/components/when-client';

import { AccountDetailPage } from './account.page';

export function meta() {
  return [{ title: 'Account – Leather Multisig' }] satisfies MetaDescriptor[];
}

export default function AccountRoute() {
  return (
    <WhenClient>
      <AccountDetailPage />
    </WhenClient>
  );
}
