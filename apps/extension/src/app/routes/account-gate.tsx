import { ReactNode } from 'react';
import { Navigate } from 'react-router';

import { RouteUrls } from '@shared/route-urls';

import { useHasActiveInMemoryWalletSecretKey } from '@app/store/in-memory-key/in-memory-key.selectors';
import { useHasLedgerKeys } from '@app/store/ledger/ledger.selectors';
import { useActiveSoftwareKey } from '@app/store/software-keys/software-key.selectors';

/** @knipignore */
export function shouldNavigateToOnboardingStartPage(currentKeyDetails?: any) {
  return !currentKeyDetails;
}

/** @knipignore */
export function shouldNavigateToUnlockWalletPage(hasDefaultInMemorySecretKey: boolean) {
  return !hasDefaultInMemorySecretKey;
}

interface AccountGateProps {
  children?: ReactNode;
}
export function AccountGate({ children }: AccountGateProps) {
  const currentKeyDetails = useActiveSoftwareKey();
  const hasDefaultInMemorySecretKey = useHasActiveInMemoryWalletSecretKey();

  const isLedger = useHasLedgerKeys();
  if (isLedger) return children;

  if (shouldNavigateToOnboardingStartPage(currentKeyDetails))
    return <Navigate to={RouteUrls.Onboarding} />;

  if (shouldNavigateToUnlockWalletPage(hasDefaultInMemorySecretKey))
    return <Navigate to={RouteUrls.Unlock} />;

  return children;
}
