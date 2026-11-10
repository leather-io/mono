import { webHidIdentifier, webHidTransportFactory } from '@ledgerhq/device-transport-kit-web-hid';

import { type HardwareWalletConnector, createLedgerConnector } from '@leather.io/ledger';

import { isPopupMode } from '@app/common/utils';

export function createExtensionLedgerConnector(): HardwareWalletConnector {
  return createLedgerConnector({
    transportFactory: webHidTransportFactory,
    transportIdentifier: webHidIdentifier,
    canPromptForDevice: () => !isPopupMode(),
  });
}
