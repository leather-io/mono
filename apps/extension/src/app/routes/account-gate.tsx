import { ReactNode } from 'react';
import { Navigate } from 'react-router';

import { RouteUrls } from '@shared/route-urls';

import { useHasLockedSoftwareWallets } from '@app/store/in-memory-key/in-memory-key.selectors';
import { useWallets } from '@app/store/wallets/wallet.selectors';

interface AccountGateProps {
  children?: ReactNode;
}
export function AccountGate({ children }: AccountGateProps) {
  const wallets = useWallets();
  const hasLockedSoftwareWallets = useHasLockedSoftwareWallets();

  if (wallets.length === 0) return <Navigate to={RouteUrls.Onboarding} />;

  if (hasLockedSoftwareWallets) return <Navigate to={RouteUrls.Unlock} />;

  return children;
}
