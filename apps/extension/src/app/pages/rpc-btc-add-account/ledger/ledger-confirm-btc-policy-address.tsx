import { Route } from 'react-router';

import { RouteUrls } from '@shared/route-urls';
import { closeWindow } from '@shared/utils';

import { LedgerDmkProvider, useLedgerDmk } from '@app/features/ledger/dmk/ledger-dmk.context';
import { LedgerRequestKeysContext } from '@app/features/ledger/generic-flows/request-keys/ledger-request-keys.context';
import { RequestKeysFlow } from '@app/features/ledger/generic-flows/request-keys/request-keys-flow';
import { ConnectLedgerRequestKeys } from '@app/features/ledger/generic-flows/request-keys/steps/connect-ledger-request-keys';
import { useRequestLedgerKeys } from '@app/features/ledger/generic-flows/request-keys/use-request-ledger-keys';
import {
  CheckingAppVersion,
  ConnectLedgerError,
  ConnectLedgerSuccess,
  DeviceBusy,
  LedgerDisconnected,
  UnsupportedBrowserLayout,
} from '@app/features/ledger/generic-steps';
import { useDisplayLedgerDescriptorAddress } from '@app/features/ledger/hooks/use-display-ledger-descriptor-address';
import { useLedgerNavigate } from '@app/features/ledger/hooks/use-ledger-navigate';
import {
  connectLedgerBitcoinApp,
  getBitcoinAppVersion,
  isBitcoinAppOpen,
} from '@app/features/ledger/utils/bitcoin-ledger-utils';
import { useSignerActionController } from '@app/features/ledger/utils/bitcoin-signer-kit-utils';
import { useCancelLedgerAction } from '@app/features/ledger/utils/generic-ledger-utils';
import type { LedgerBitcoinApp } from '@app/features/ledger/utils/ledger-app';
import {
  isLedgerOnDeviceAddressConfirmed,
  toLedgerDisplayedAddress,
} from '@app/features/ledger/utils/ledger-descriptor-address';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';

import { useBtcAddAccount } from '../use-btc-add-account';

// Drives the on-device confirmation for btc_addAccount on a Ledger wallet. It
// reuses the generic request-keys flow (connect → version → success/error) and,
// once connected, displays the multisig `wsh` address on the device. The request
// (and so the same derived address and add/verify behaviour) is read from the
// stable popup search params via `useBtcAddAccount`, so on success this owns the
// dApp response: it finalizes (registers in add mode, returns the verified
// address in verify mode) and closes the popup.
function LedgerConfirmBtcPolicyAddress() {
  const dmk = useLedgerDmk();
  const signerActions = useSignerActionController();
  const ledgerNavigate = useLedgerNavigate();
  const network = useCurrentNetwork();
  const { descriptor, address, finalize } = useBtcAddAccount();
  const displayLedgerDescriptorAddress = useDisplayLedgerDescriptorAddress();

  function toConfirmAddressStep() {
    void ledgerNavigate.toDeviceBusyStep(
      'Confirm the address on your Ledger…',
      address ? toLedgerDisplayedAddress(address) : undefined
    );
  }

  const { requestKeys, latestDeviceResponse, awaitingDeviceConnection } =
    useRequestLedgerKeys<LedgerBitcoinApp>({
      chain: 'bitcoin',
      connectApp: connectLedgerBitcoinApp(dmk, network.chain.bitcoin.mode, signerActions.run),
      getAppVersion: getBitcoinAppVersion(dmk),
      isAppOpen: isBitcoinAppOpen({ network: network.chain.bitcoin.mode }),
      async onSuccess() {
        await finalize();
        closeWindow();
      },
      async pullKeysFromDevice(app) {
        toConfirmAddressStep();
        const onDeviceAddress = await displayLedgerDescriptorAddress(app, descriptor, {
          onWalletRegistered: toConfirmAddressStep,
        });
        if (!isLedgerOnDeviceAddressConfirmed(onDeviceAddress, address)) {
          void ledgerNavigate.toErrorStep(
            'bitcoin',
            'The address shown on your Ledger does not match the one in Leather.'
          );
          return { status: 'failure' };
        }
        return { status: 'success' };
      },
    });

  const ledgerContextValue: LedgerRequestKeysContext = {
    chain: 'bitcoin',
    pullPublicKeysFromDevice: requestKeys,
    latestDeviceResponse,
    awaitingDeviceConnection,
  };

  const canCancelLedgerAction = useCancelLedgerAction(awaitingDeviceConnection);
  return (
    <RequestKeysFlow
      context={ledgerContextValue}
      isActionCancellableByUser={canCancelLedgerAction}
      onCancelAction={signerActions.cancelActive}
    />
  );
}

export const ledgerConfirmBtcPolicyAddressRoutes = (
  <Route
    element={
      <LedgerDmkProvider>
        <LedgerConfirmBtcPolicyAddress />
      </LedgerDmkProvider>
    }
  >
    <Route path={RouteUrls.ConnectLedger} element={<ConnectLedgerRequestKeys />} />
    <Route path={RouteUrls.LedgerCheckingAppVersion} element={<CheckingAppVersion />} />
    <Route path={RouteUrls.DeviceBusy} element={<DeviceBusy />} />
    <Route path={RouteUrls.ConnectLedgerError} element={<ConnectLedgerError />} />
    <Route path={RouteUrls.ConnectLedgerSuccess} element={<ConnectLedgerSuccess />} />
    <Route path={RouteUrls.LedgerDisconnected} element={<LedgerDisconnected />} />
    <Route path={RouteUrls.LedgerUnsupportedBrowser} element={<UnsupportedBrowserLayout />} />
  </Route>
);
