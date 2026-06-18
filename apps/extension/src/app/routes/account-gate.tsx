import { ReactNode } from 'react';
import { Navigate } from 'react-router';

import { RouteUrls } from '@shared/route-urls';

import { useHasLockedSoftwareWallets } from '@app/store/in-memory-key/in-memory-key.selectors';
import { useWallets } from '@app/store/wallets/wallet.selectors';

interface AccountGateDestinationArgs {
  walletCount: number;
  hasLockedSoftwareWallets: boolean;
}

/** @knipignore exported only for unit testing; consumed internally by `AccountGate` */
export function selectAccountGateDestination({
  walletCount,
  hasLockedSoftwareWallets,
}: AccountGateDestinationArgs): RouteUrls.Onboarding | RouteUrls.Unlock | null {
  if (walletCount === 0) return RouteUrls.Onboarding;
  if (hasLockedSoftwareWallets) return RouteUrls.Unlock;
  return null;
}

export function useAccountGateDestination() {
  const wallets = useWallets();
  const hasLockedSoftwareWallets = useHasLockedSoftwareWallets();

  return selectAccountGateDestination({
    walletCount: wallets.length,
    hasLockedSoftwareWallets,
  });
}

interface AccountGateProps {
  children?: ReactNode;
}
export function AccountGate({ children }: AccountGateProps) {
  const destination = useAccountGateDestination();

  if (destination) return <Navigate to={destination} />;

  return children;
}
