import { type MetaDescriptor, Navigate } from 'react-router';

import { WhenClient } from '~/components/when-client';
import { useSession } from '~/features/multisig/auth/use-session';

import { MultisigDashboardPage, MultisigDashboardSkeleton } from './dashboard/dashboard.page';
import { multisigPaths } from './multisig.constants';

export function meta() {
  return [
    { title: 'Multisig – Leather' },
    { name: 'description', content: 'Shared multisig vaults on Bitcoin and Stacks' },
  ] satisfies MetaDescriptor[];
}

function MultisigIndex() {
  const btcSession = useSession('btc:mainnet');
  const stxSession = useSession('stx:mainnet');

  if (!btcSession && !stxSession) {
    return <Navigate to={multisigPaths.onboarding} replace />;
  }
  return <MultisigDashboardPage />;
}

export default function MultisigRoute() {
  return (
    <WhenClient fallback={<MultisigDashboardSkeleton />}>
      <MultisigIndex />
    </WhenClient>
  );
}
