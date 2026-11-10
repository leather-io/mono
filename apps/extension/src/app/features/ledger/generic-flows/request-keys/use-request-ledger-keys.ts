import type { ConnectRequest, HardwareWallet, OperationContext } from '@leather.io/ledger';

import { useHardwareWalletOperation } from '../../hardware-wallet/use-hardware-wallet-operation';
import { useLedgerAnalytics } from '../../hooks/use-ledger-analytics.hook';

const checkingAppVersionDelayMs = 1_000;

type RequestLedgerKeysResult = { status: 'success' } | { status: 'failure' };

interface UseRequestLedgerKeysArgs {
  connectRequest: ConnectRequest;
  pullKeysFromDevice(
    wallet: HardwareWallet,
    ctx: OperationContext
  ): Promise<RequestLedgerKeysResult>;
  onSuccess(): void;
}
export function useRequestLedgerKeys({
  connectRequest,
  pullKeysFromDevice,
  onSuccess,
}: UseRequestLedgerKeysArgs) {
  const ledgerAnalytics = useLedgerAnalytics();

  const { run, ...operation } = useHardwareWalletOperation({
    connectRequest,
    checkingAppVersionDelayMs,
    operation: pullKeysFromDevice,
    onSuccess(result) {
      if (result.status === 'failure') return;
      ledgerAnalytics.publicKeysPulledFromLedgerSuccessfully();
      onSuccess();
    },
  });

  return { requestKeys: run, ...operation };
}
