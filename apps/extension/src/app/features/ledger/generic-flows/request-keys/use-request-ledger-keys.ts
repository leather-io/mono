import { useState } from 'react';

import StacksApp from '@zondax/ledger-stacks';
import BitcoinApp from 'ledger-bitcoin';

import type { SupportedBlockchains } from '@leather.io/models';
import { delay, isError } from '@leather.io/utils';

import { useLedgerAnalytics } from '../../hooks/use-ledger-analytics.hook';
import { useLedgerNavigate } from '../../hooks/use-ledger-navigate';
import { BitcoinAppVersion } from '../../utils/bitcoin-ledger-utils';
import {
  LedgerConnectionErrors,
  checkLockedDeviceError,
  useLedgerResponseState,
} from '../../utils/generic-ledger-utils';
import { StacksAppVersion } from '../../utils/stacks-ledger-utils';

export const defaultNumberOfKeysToPullFromLedgerDevice = 10;

interface UseRequestLedgerKeysArgs<App extends BitcoinApp | StacksApp> {
  chain: SupportedBlockchains;
  isAppOpen({ name }: { name: string }): boolean;
  getAppVersion(app: App): Promise<StacksAppVersion> | Promise<BitcoinAppVersion>;
  connectApp(): Promise<App>;
  pullKeysFromDevice(app: App): Promise<void>;
  passesAdditionalVersionCheck?(appVersion: StacksAppVersion | BitcoinAppVersion): Promise<boolean>;
  onSuccess(): void;
}
export function useRequestLedgerKeys<App extends BitcoinApp | StacksApp>({
  chain,
  connectApp,
  getAppVersion,
  pullKeysFromDevice,
  isAppOpen,
  passesAdditionalVersionCheck,
  onSuccess,
}: UseRequestLedgerKeysArgs<App>) {
  const [outdatedAppVersionWarning, setAppVersionOutdatedWarning] = useState(false);
  const [latestDeviceResponse, setLatestDeviceResponse] = useLedgerResponseState();
  const [awaitingDeviceConnection, setAwaitingDeviceConnection] = useState(false);
  const ledgerNavigate = useLedgerNavigate();
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
    let app;
    try {
      setLatestDeviceResponse({ deviceLocked: false } as any);
      setAwaitingDeviceConnection(true);
      app = await connectApp();
      const versionCheckResult = await checkCorrectAppIsOpenWithFailState(app);

      // If version check failed, return early (navigation already handled)
      if (versionCheckResult === null) {
        setAwaitingDeviceConnection(false);
        return;
      }

      setAwaitingDeviceConnection(false);
      void ledgerNavigate.toConnectionSuccessStep(chain);
      await delay(1250);
      await pullKeysFromDevice(app);
      ledgerAnalytics.publicKeysPulledFromLedgerSuccessfully();
      onSuccess?.();
    } catch (e) {
      setAwaitingDeviceConnection(false);
      if (isError(e) && checkLockedDeviceError(e)) {
        setLatestDeviceResponse({ deviceLocked: true } as any);
        return;
      }

      if (isError(e) && e.message === LedgerConnectionErrors.MasterkeyFingerprintNotSupported) {
        const currentVersion = (e as any).currentVersion;
        const versionInfo = currentVersion
          ? {
              currentVersion: `${currentVersion.major}.${currentVersion.minor}.${currentVersion.patch}`,
              requiredVersion: '0.26.4',
            }
          : undefined;
        void ledgerNavigate.toStacksAppOutdatedWarning(versionInfo);
        return;
      }

      void ledgerNavigate.toErrorStep(chain);
    } finally {
      await app?.transport.close();
    }
  }

  return {
    requestKeys,
    outdatedAppVersionWarning,
    setAppVersionOutdatedWarning,
    latestDeviceResponse,
    setLatestDeviceResponse,
    awaitingDeviceConnection,
    setAwaitingDeviceConnection,
  };
}
