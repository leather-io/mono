import { useRef, useState } from 'react';

import {
  type ConnectRequest,
  type HardwareWallet,
  type HardwareWalletInteraction,
  type HardwareWalletSession,
  type OperationContext,
  withHardwareWallet,
} from '@leather.io/ledger';
import { delay } from '@leather.io/utils';

import { useLedgerSteps } from '../flow/ledger-flow.context';
import { useLedgerResponseState } from '../utils/generic-ledger-utils';
import { handleHardwareWalletError } from './handle-hardware-wallet-error';
import { useHardwareWalletConnector } from './hardware-wallet.context';

const connectionSuccessDelayMs = 1250;

type HardwareWalletFlowOperation<T> = (
  wallet: HardwareWallet,
  ctx: OperationContext,
  session: HardwareWalletSession
) => Promise<T>;

interface UseHardwareWalletOperationArgs<T> {
  connectRequest: ConnectRequest;
  checkingAppVersionDelayMs: number;
  operation: HardwareWalletFlowOperation<T>;
  onSuccess?(result: T): void;
}

function isCancellableConnectionInteraction(interaction: HardwareWalletInteraction) {
  return interaction.type === 'unlock-device' || interaction.type === 'open-app';
}

export function useHardwareWalletOperation<T>({
  connectRequest,
  checkingAppVersionDelayMs,
  operation,
  onSuccess,
}: UseHardwareWalletOperationArgs<T>) {
  const connector = useHardwareWalletConnector();
  const ledgerNavigate = useLedgerSteps();
  const [latestDeviceResponse, setLatestDeviceResponse] = useLedgerResponseState();
  const [awaitingDeviceConnection, setAwaitingDeviceConnection] = useState(false);
  const [isConnectionCancellable, setIsConnectionCancellable] = useState(false);
  const activeOperation = useRef<AbortController | null>(null);
  const { chain } = connectRequest;

  function onInteraction(interaction: HardwareWalletInteraction) {
    setLatestDeviceResponse({ deviceLocked: interaction.type === 'unlock-device' });
    setIsConnectionCancellable(isCancellableConnectionInteraction(interaction));
  }

  async function run(): Promise<void> {
    const controller = new AbortController();
    activeOperation.current = controller;
    const ctx: OperationContext = { signal: controller.signal, onInteraction };
    try {
      setLatestDeviceResponse({ deviceLocked: false });
      setAwaitingDeviceConnection(true);
      const result = await withHardwareWallet(
        connector,
        connectRequest,
        ctx,
        async (wallet, session) => {
          setIsConnectionCancellable(false);
          ledgerNavigate.toCheckingAppVersion();
          await delay(checkingAppVersionDelayMs);
          setAwaitingDeviceConnection(false);
          ledgerNavigate.toConnectionSuccessStep(chain);
          await delay(connectionSuccessDelayMs);
          return operation(wallet, ctx, session);
        }
      );
      onSuccess?.(result);
    } catch (e) {
      setAwaitingDeviceConnection(false);
      setIsConnectionCancellable(false);
      handleHardwareWalletError(e, { chain, ledgerNavigate, setLatestDeviceResponse });
    } finally {
      if (activeOperation.current === controller) activeOperation.current = null;
    }
  }

  function cancel() {
    activeOperation.current?.abort();
    activeOperation.current = null;
  }

  return {
    run,
    cancel,
    latestDeviceResponse,
    setLatestDeviceResponse,
    awaitingDeviceConnection,
    setAwaitingDeviceConnection,
    isConnectionCancellable,
  };
}
