import { useState } from 'react';

import { UserInteractionRequired } from '@ledgerhq/device-management-kit';

import type { SupportedBlockchains } from '@leather.io/models';
import { delay } from '@leather.io/utils';

import type { ConnectLedgerDeviceOptions } from '../../dmk/ledger-device-connection';
import { LedgerConnectionErrors, handleLedgerConnectionError } from '../../dmk/ledger-dmk-errors';
import { useLedgerDmk } from '../../dmk/ledger-dmk.context';
import { closeLedgerSession } from '../../dmk/ledger-session';
import { useLedgerSteps } from '../../flow/ledger-flow.context';
import { useLedgerAnalytics } from '../../hooks/use-ledger-analytics.hook';
import { BitcoinAppVersion } from '../../utils/bitcoin-ledger-utils';
import {
  isCancellableConnectionInteraction,
  useLedgerResponseState,
} from '../../utils/generic-ledger-utils';
import type { LedgerApp } from '../../utils/ledger-app';
import { StacksAppVersion } from '../../utils/stacks-ledger-utils';

export const defaultNumberOfKeysToPullFromLedgerDevice = 10;

type RequestLedgerKeysResult = { status: 'success' } | { status: 'failure' };

interface UseRequestLedgerKeysArgs<App extends LedgerApp> {
  chain: SupportedBlockchains;
  isAppOpen({ name }: { name: string }): boolean;
  getAppVersion(app: App): Promise<StacksAppVersion> | Promise<BitcoinAppVersion>;
  connectApp(options: ConnectLedgerDeviceOptions): Promise<App>;
  pullKeysFromDevice(app: App): Promise<RequestLedgerKeysResult>;
  passesAdditionalVersionCheck?(appVersion: StacksAppVersion | BitcoinAppVersion): Promise<boolean>;
  onSuccess(): void;
}
export function useRequestLedgerKeys<App extends LedgerApp>({
  chain,
  connectApp,
  getAppVersion,
  pullKeysFromDevice,
  isAppOpen,
  passesAdditionalVersionCheck,
  onSuccess,
}: UseRequestLedgerKeysArgs<App>) {
  const dmk = useLedgerDmk();
  const [latestDeviceResponse, setLatestDeviceResponse] = useLedgerResponseState();
  const [awaitingDeviceConnection, setAwaitingDeviceConnection] = useState(false);
  const [isConnectionCancellable, setIsConnectionCancellable] = useState(false);
  const ledgerNavigate = useLedgerSteps();
  const ledgerAnalytics = useLedgerAnalytics();

  async function checkCorrectAppIsOpenWithFailState(app: App) {
    // Show checking version page immediately
    void ledgerNavigate.toCheckingAppVersion();
    await delay(1_000);

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

  async function requestKeys() {
    let app: App | undefined;
    try {
      setLatestDeviceResponse({ deviceLocked: false });
      setAwaitingDeviceConnection(true);
      app = await connectApp({
        onRequiredUserInteraction(interaction) {
          setLatestDeviceResponse({
            deviceLocked: interaction === UserInteractionRequired.UnlockDevice,
          });
          setIsConnectionCancellable(isCancellableConnectionInteraction(interaction));
        },
      });
      setIsConnectionCancellable(false);
      const versionCheckResult = await checkCorrectAppIsOpenWithFailState(app);

      // If version check failed, return early (navigation already handled)
      if (versionCheckResult === null) {
        setAwaitingDeviceConnection(false);
        return;
      }

      setAwaitingDeviceConnection(false);
      void ledgerNavigate.toConnectionSuccessStep(chain);
      await delay(1250);
      const pullKeysResult = await pullKeysFromDevice(app);
      if (pullKeysResult.status === 'failure') return;
      ledgerAnalytics.publicKeysPulledFromLedgerSuccessfully();
      onSuccess?.();
    } catch (e) {
      setAwaitingDeviceConnection(false);
      setIsConnectionCancellable(false);
      handleLedgerConnectionError(e, { chain, ledgerNavigate, setLatestDeviceResponse });
    } finally {
      if (app) await closeLedgerSession(dmk, app.sessionId);
    }
  }

  return {
    requestKeys,
    latestDeviceResponse,
    setLatestDeviceResponse,
    awaitingDeviceConnection,
    setAwaitingDeviceConnection,
    isConnectionCancellable,
  };
}
