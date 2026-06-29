import { type MetaDescriptor, Navigate, useSearchParams } from 'react-router';

import { WhenClient } from '~/components/when-client';
import { useMultisigNetworks } from '~/features/multisig/auth/use-multisig-networks';
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
  const { btc: btcNetwork, stx: stxNetwork } = useMultisigNetworks();
  const btcSession = useSession(btcNetwork);
  const stxSession = useSession(stxNetwork);
  const [searchParams] = useSearchParams();

  if (!btcSession && !stxSession) {
    const invite = searchParams.get('invite');
    return (
      <Navigate
        to={
          invite
            ? `${multisigPaths.onboarding}?invite=${encodeURIComponent(invite)}`
            : multisigPaths.onboarding
        }
        replace
      />
    );
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
