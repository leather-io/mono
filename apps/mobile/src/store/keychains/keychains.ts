import { AccountLookup } from '@/shared/types';

import { BitcoinAccountKeychain } from '@leather.io/bitcoin';

import { useBitcoinAccounts } from './bitcoin/bitcoin-keychains.read';

interface BitcoinAccountLoaderProps extends AccountLookup {
  fallback?: React.ReactNode;
  children({
    nativeSegwit,
    taproot,
  }: {
    nativeSegwit: BitcoinAccountKeychain;
    taproot: BitcoinAccountKeychain;
  }): React.ReactNode;
}
export function BitcoinAccountLoader({
  fingerprint,
  accountIndex,
  fallback,
  children,
}: BitcoinAccountLoaderProps) {
  const { nativeSegwit, taproot } = useBitcoinAccounts().accountIndexByPaymentType(
    fingerprint,
    accountIndex
  );
  if (!nativeSegwit || !taproot) return fallback ?? null;
  return children({ nativeSegwit, taproot });
}
