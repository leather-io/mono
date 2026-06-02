import { type MetaDescriptor } from 'react-router';

import { WhenClient } from '~/components/when-client';

import { MultisigDashboardPage, MultisigDashboardSkeleton } from './dashboard/dashboard.page';

export function meta() {
  return [
    { title: 'Multisig – Leather' },
    { name: 'description', content: 'Shared multisig vaults on Bitcoin and Stacks' },
  ] satisfies MetaDescriptor[];
}

export default function MultisigRoute() {
  return (
    <WhenClient fallback={<MultisigDashboardSkeleton />}>
      <MultisigDashboardPage />
    </WhenClient>
  );
}
