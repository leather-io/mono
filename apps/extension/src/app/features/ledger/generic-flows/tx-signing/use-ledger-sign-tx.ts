import type { ConnectRequest, HardwareWallet, OperationContext } from '@leather.io/ledger';

import { useHardwareWalletOperation } from '../../hardware-wallet/use-hardware-wallet-operation';

const checkingAppVersionDelayMs = 500;

interface UseLedgerSignTxArgs {
  connectRequest: ConnectRequest;
  onSuccess?(): void;
  signTransactionWithDevice(wallet: HardwareWallet, ctx: OperationContext): Promise<void>;
}

export function useLedgerSignTx({
  connectRequest,
  onSuccess,
  signTransactionWithDevice,
}: UseLedgerSignTxArgs) {
  const { run, ...operation } = useHardwareWalletOperation({
    connectRequest,
    checkingAppVersionDelayMs,
    operation: signTransactionWithDevice,
    onSuccess,
  });

  return { signTransaction: run, ...operation };
}
