import { ConnectLedgerStacks } from '@app/features/ledger/generic-steps/connect-device/connect-ledger-stacks';
import { useActiveWalletType } from '@app/store/common/wallet-type.selectors';
import { useHasLedgerStacksKeys } from '@app/store/ledger/ledger.selectors';

interface LedgerStacksGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
export function LedgerStacksGate({
  children,
  fallback = <ConnectLedgerStacks />,
}: LedgerStacksGateProps) {
  const isLedger = useActiveWalletType() === 'ledger';
  const hasLedgerStacksKeys = useHasLedgerStacksKeys();
  if (!isLedger || hasLedgerStacksKeys) return children;
  return fallback;
}
