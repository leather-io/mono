import { ReactNode } from 'react';
import { Navigate } from 'react-router';

import { RouteUrls } from '@shared/route-urls';

import { useHasLockedSoftwareWallets } from '@app/store/in-memory-key/in-memory-key.selectors';
import { useHasKeychains } from '@app/store/keychains/keychain.selectors';

interface AccountGateProps {
  children?: ReactNode;
}
export function AccountGate({ children }: AccountGateProps) {
  const hasKeychains = useHasKeychains();
  const hasLockedSoftwareWallets = useHasLockedSoftwareWallets();

  if (!hasKeychains) return <Navigate to={RouteUrls.Onboarding} />;

  if (hasLockedSoftwareWallets) return <Navigate to={RouteUrls.Unlock} />;

  return children;
}
