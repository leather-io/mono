import { Route, useNavigate } from 'react-router';

import StacksApp from '@zondax/ledger-stacks';

import { RouteUrls } from '@shared/route-urls';
import { closeWindow } from '@shared/utils';

import {
  LedgerRequestKeysContext,
  useLedgerRequestKeysContext,
} from '@app/features/ledger/generic-flows/request-keys/ledger-request-keys.context';
import { RequestKeysFlow } from '@app/features/ledger/generic-flows/request-keys/request-keys-flow';
import { ConnectLedgerRequestKeys } from '@app/features/ledger/generic-flows/request-keys/steps/connect-ledger-request-keys';
import { useRequestLedgerKeys } from '@app/features/ledger/generic-flows/request-keys/use-request-ledger-keys';
import {
  CheckingAppVersion,
  ConnectLedgerError,
  ConnectLedgerSuccess,
  DeviceBusy,
  OutdatedStacksAppWarningBase,
  UnsupportedBrowserLayout,
} from '@app/features/ledger/generic-steps';
import { useLedgerNavigate } from '@app/features/ledger/hooks/use-ledger-navigate';
import { useCancelLedgerAction } from '@app/features/ledger/utils/generic-ledger-utils';
import { isLedgerOnDeviceAddressConfirmed } from '@app/features/ledger/utils/ledger-descriptor-address';
import {
  MINIMUM_STACKS_APP_VERSION_MULTISIG_ADDRESS,
  connectLedgerStacksApp,
  getStacksAppVersion,
  isStacksAppOpen,
  isStxAddressResponseRejected,
  isStxAddressResponseSuccess,
  makeStxMultisigAddressOptions,
  showStxMultisigAddressOnDevice,
  stacksChainIdToMultiSigAddressVersion,
} from '@app/features/ledger/utils/stacks-ledger-utils';
import { stacksVersionGate } from '@app/features/ledger/utils/stacks-version-gate';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';

import { useStxAddAccount } from '../use-stx-add-account';

function ConfirmStxPolicyOutdatedAppWarning() {
  const navigate = useNavigate();
  const { pullPublicKeysFromDevice } = useLedgerRequestKeysContext();
  return (
    <OutdatedStacksAppWarningBase
      onTryAgain={pullPublicKeysFromDevice}
      onCancel={() => void navigate('..')}
    />
  );
}

function LedgerConfirmStxPolicyAddress() {
  const ledgerNavigate = useLedgerNavigate();
  const stacksAccount = useCurrentStacksAccount();
  const { publicKeys, threshold, address, chainId, finalize } = useStxAddAccount();

  const { requestKeys, latestDeviceResponse, awaitingDeviceConnection } =
    useRequestLedgerKeys<StacksApp>({
      chain: 'stacks',
      connectApp: connectLedgerStacksApp,
      getAppVersion: getStacksAppVersion,
      isAppOpen: isStacksAppOpen,
      passesAdditionalVersionCheck: stacksVersionGate(
        ledgerNavigate,
        MINIMUM_STACKS_APP_VERSION_MULTISIG_ADDRESS
      ),
      async onSuccess() {
        await finalize();
        closeWindow();
      },
      async pullKeysFromDevice(app) {
        if (!stacksAccount || !address || chainId === null) {
          void ledgerNavigate.toErrorStep('stacks');
          return { status: 'failure' };
        }
        const optionsResult = makeStxMultisigAddressOptions({
          publicKeys,
          threshold,
          devicePublicKey: stacksAccount.stxPublicKey,
        });
        if (optionsResult.status === 'error') {
          void ledgerNavigate.toErrorStep('stacks', optionsResult.message);
          return { status: 'failure' };
        }
        void ledgerNavigate.toDeviceBusyStep('Confirm the address on your Ledger…', address);
        const response = await showStxMultisigAddressOnDevice(app)(
          stacksAccount.derivationPath,
          stacksChainIdToMultiSigAddressVersion(chainId),
          optionsResult.options
        );
        if (isStxAddressResponseRejected(response)) {
          void ledgerNavigate.toErrorStep(
            'stacks',
            'Address verification was rejected on the device.'
          );
          return { status: 'failure' };
        }
        if (!isStxAddressResponseSuccess(response)) {
          void ledgerNavigate.toErrorStep('stacks', response.errorMessage);
          return { status: 'failure' };
        }
        if (!isLedgerOnDeviceAddressConfirmed(response.address, address)) {
          void ledgerNavigate.toErrorStep(
            'stacks',
            'The address shown on your Ledger does not match the one in Leather.'
          );
          return { status: 'failure' };
        }
        return { status: 'success' };
      },
    });

  const ledgerContextValue: LedgerRequestKeysContext = {
    chain: 'stacks',
    pullPublicKeysFromDevice: requestKeys,
    latestDeviceResponse,
    awaitingDeviceConnection,
  };

  const canCancelLedgerAction = useCancelLedgerAction(awaitingDeviceConnection);
  return (
    <RequestKeysFlow
      context={ledgerContextValue}
      isActionCancellableByUser={canCancelLedgerAction}
    />
  );
}

export const ledgerConfirmStxPolicyAddressRoutes = (
  <Route element={<LedgerConfirmStxPolicyAddress />}>
    <Route path={RouteUrls.ConnectLedger} element={<ConnectLedgerRequestKeys />} />
    <Route path={RouteUrls.LedgerCheckingAppVersion} element={<CheckingAppVersion />} />
    <Route path={RouteUrls.DeviceBusy} element={<DeviceBusy />} />
    <Route path={RouteUrls.ConnectLedgerError} element={<ConnectLedgerError />} />
    <Route path={RouteUrls.ConnectLedgerSuccess} element={<ConnectLedgerSuccess />} />
    <Route path={RouteUrls.LedgerUnsupportedBrowser} element={<UnsupportedBrowserLayout />} />
    <Route
      path={RouteUrls.LedgerOutdatedAppWarning}
      element={<ConfirmStxPolicyOutdatedAppWarning />}
    />
  </Route>
);
