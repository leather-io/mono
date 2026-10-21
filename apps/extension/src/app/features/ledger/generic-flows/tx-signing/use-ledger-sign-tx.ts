import { useState } from 'react';

import type { SupportedBlockchains } from '@leather.io/models';
import { delay } from '@leather.io/utils';

import type { ConnectLedgerDeviceOptions } from '../../dmk/ledger-device-connection';
import { LedgerConnectionErrors, handleLedgerConnectionError } from '../../dmk/ledger-dmk-errors';
import { useLedgerDmk } from '../../dmk/ledger-dmk.context';
import { closeLedgerSession } from '../../dmk/ledger-session';
import { useLedgerSteps } from '../../flow/ledger-flow.context';
import { type BitcoinAppVersion } from '../../utils/bitcoin-ledger-utils';
import {
  isCancellableConnectionInteraction,
  isUnlockDeviceInteraction,
  useLedgerAttemptGuard,
  useLedgerResponseState,
} from '../../utils/generic-ledger-utils';
import type { LedgerApp } from '../../utils/ledger-app';
import { type StacksAppVersion } from '../../utils/stacks-ledger-utils';

interface UseLedgerSignTxArgs<App extends LedgerApp> {
  chain: SupportedBlockchains;
  isAppOpen({ name }: { name: string }): boolean;
  getAppVersion(app: App): Promise<StacksAppVersion> | Promise<BitcoinAppVersion>;
  connectApp(options: ConnectLedgerDeviceOptions): Promise<App>;
  passesAdditionalVersionCheck?(appVersion: StacksAppVersion | BitcoinAppVersion): Promise<boolean>;
  onSuccess?(): void;
  signTransactionWithDevice(app: App): Promise<void>;
}

export function useLedgerSignTx<App extends LedgerApp>({
  chain,
  isAppOpen,
  getAppVersion,
  connectApp,
  onSuccess,
  signTransactionWithDevice,
  passesAdditionalVersionCheck,
}: UseLedgerSignTxArgs<App>) {
  const dmk = useLedgerDmk();
  const [latestDeviceResponse, setLatestDeviceResponse] = useLedgerResponseState();
  const [awaitingDeviceConnection, setAwaitingDeviceConnection] = useState(false);
  const [isConnectionCancellable, setIsConnectionCancellable] = useState(false);
  const ledgerNavigate = useLedgerSteps();
  const ledgerAttempt = useLedgerAttemptGuard();
  async function checkCorrectAppIsOpenWithFailState(app: App) {
    // Show checking version page immediately
    ledgerNavigate.toCheckingAppVersion();
    await delay(500);

    const response = await getAppVersion(app);
    if (!isAppOpen({ name: response.name })) {
      setAwaitingDeviceConnection(false);
      throw new Error(LedgerConnectionErrors.AppNotOpen);
    }

    const passedAdditionalVersionCheck = await passesAdditionalVersionCheck?.(response);
    if (passedAdditionalVersionCheck === false) {
      // Version check failed, navigation handled in passesAdditionalVersionCheck
      // Return null to signal that we should not continue
      return null;
    }
    return response;
  }

  async function signTransactionImpl() {
    const attempt = ledgerAttempt.start();
    if (!attempt) return;
    let app: App | undefined;
    let failure: { error: unknown } | undefined;
    try {
      setLatestDeviceResponse({ deviceLocked: false });
      setAwaitingDeviceConnection(true);
      app = await connectApp({
        onRequiredUserInteraction(interaction) {
          setLatestDeviceResponse({
            deviceLocked: isUnlockDeviceInteraction(interaction),
          });
          setIsConnectionCancellable(isCancellableConnectionInteraction(interaction));
        },
      });
      if (attempt.isDismissed()) return;
      setIsConnectionCancellable(false);
      const versionCheckResult = await checkCorrectAppIsOpenWithFailState(app);
      if (attempt.isDismissed()) return;

      // If version check failed, return early (navigation already handled)
      if (versionCheckResult === null) {
        setAwaitingDeviceConnection(false);
        return;
      }

      setAwaitingDeviceConnection(false);
      ledgerNavigate.toConnectionSuccessStep(chain);
      await delay(1250);
      if (attempt.isDismissed()) return;
      await signTransactionWithDevice(app);
      if (attempt.isDismissed()) return;
      onSuccess?.();
    } catch (e) {
      setAwaitingDeviceConnection(false);
      setIsConnectionCancellable(false);
      failure = { error: e };
    } finally {
      if (app) await closeLedgerSession(dmk, app.sessionId);
      attempt.finish();
    }
    if (failure && !attempt.isDismissed()) {
      handleLedgerConnectionError(failure.error, {
        chain,
        ledgerNavigate,
        setLatestDeviceResponse,
      });
    }
  }

  return {
    signTransaction: signTransactionImpl,
    latestDeviceResponse,
    setLatestDeviceResponse,
    awaitingDeviceConnection,
    setAwaitingDeviceConnection,
    isConnectionCancellable,
  };
}
