import { useState } from 'react';

import BitcoinApp from '@ledgerhq/ledger-bitcoin';
import StacksApp from '@zondax/ledger-stacks';

import type { SupportedBlockchains } from '@leather.io/models';
import { delay, isError } from '@leather.io/utils';

import { logger } from '@shared/logger';

import { useLedgerNavigate } from '../../hooks/use-ledger-navigate';
import { BitcoinAppVersion } from '../../utils/bitcoin-ledger-utils';
import {
  LedgerConnectionErrors,
  checkLockedDeviceError,
  useLedgerResponseState,
} from '../../utils/generic-ledger-utils';
import { StacksAppVersion } from '../../utils/stacks-ledger-utils';

interface UseLedgerSignTxArgs<App extends BitcoinApp | StacksApp> {
  chain: SupportedBlockchains;
  isAppOpen({ name }: { name: string }): boolean;
  getAppVersion(app: App): Promise<StacksAppVersion> | Promise<BitcoinAppVersion>;
  connectApp(): Promise<App>;
  passesAdditionalVersionCheck?(appVersion: StacksAppVersion | BitcoinAppVersion): Promise<boolean>;
  onSuccess?(): void;
  signTransactionWithDevice(app: App): Promise<void>;
}

export function useLedgerSignTx<App extends StacksApp | BitcoinApp>({
  chain,
  isAppOpen,
  getAppVersion,
  connectApp,
  onSuccess,
  signTransactionWithDevice,
  passesAdditionalVersionCheck,
}: UseLedgerSignTxArgs<App>) {
  const [latestDeviceResponse, setLatestDeviceResponse] = useLedgerResponseState();
  const [awaitingDeviceConnection, setAwaitingDeviceConnection] = useState(false);
  const ledgerNavigate = useLedgerNavigate();
  async function checkCorrectAppIsOpenWithFailState(app: App) {
    // Show checking version page immediately
    void ledgerNavigate.toCheckingAppVersion();
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
      await signTransactionWithDevice(app);
      onSuccess?.();
    } catch (e) {
      setAwaitingDeviceConnection(false);
      if (isError(e) && checkLockedDeviceError(e)) {
        setLatestDeviceResponse({ deviceLocked: true } as any);
        return;
      }

      return ledgerNavigate.toErrorStep(chain);
    } finally {
      try {
        await app?.transport.close();
      } catch {
        logger.warn('Failed to close transport connection to Ledger device');
      }
    }
  }

  return {
    signTransaction: signTransactionImpl,
    latestDeviceResponse,
    setLatestDeviceResponse,
    awaitingDeviceConnection,
    setAwaitingDeviceConnection,
  };
}
