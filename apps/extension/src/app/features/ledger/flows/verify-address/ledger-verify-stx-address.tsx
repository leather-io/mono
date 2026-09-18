import { useNavigate } from 'react-router';

import { RouteUrls } from '@shared/route-urls';
import { analytics } from '@shared/utils/analytics';

import { useLedgerDmk } from '@app/features/ledger/dmk/ledger-dmk.context';
import { useLedgerFlow, useLedgerSteps } from '@app/features/ledger/flow/ledger-flow.context';
import { LedgerRequestKeysContext } from '@app/features/ledger/generic-flows/request-keys/ledger-request-keys.context';
import { RequestKeysFlow } from '@app/features/ledger/generic-flows/request-keys/request-keys-flow';
import { useRequestLedgerKeys } from '@app/features/ledger/generic-flows/request-keys/use-request-ledger-keys';
import { useSignerActionController } from '@app/features/ledger/utils/bitcoin-signer-kit-utils';
import { useCancelLedgerAction } from '@app/features/ledger/utils/generic-ledger-utils';
import type { LedgerStacksApp } from '@app/features/ledger/utils/ledger-app';
import { isLedgerOnDeviceAddressConfirmed } from '@app/features/ledger/utils/ledger-descriptor-address';
import {
  connectLedgerStacksApp,
  getStacksAppVersion,
  isStacksAppOpen,
  isStxAddressResponseRejected,
  isStxAddressResponseSuccess,
  showStxAddressOnDevice,
  stacksChainIdToSingleSigAddressVersion,
} from '@app/features/ledger/utils/stacks-ledger-utils';
import { stacksVersionGate } from '@app/features/ledger/utils/stacks-version-gate';
import { useToast } from '@app/features/toasts/use-toast';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';

export function LedgerVerifyStxAddress() {
  const navigate = useNavigate();
  const toast = useToast();
  const dmk = useLedgerDmk();
  const signerActions = useSignerActionController();
  const ledgerNavigate = useLedgerSteps();
  const { close } = useLedgerFlow();
  const network = useCurrentNetwork();
  const stacksAccount = useCurrentStacksAccount();

  const { requestKeys, latestDeviceResponse, awaitingDeviceConnection, isConnectionCancellable } =
    useRequestLedgerKeys<LedgerStacksApp>({
      chain: 'stacks',
      connectApp(options) {
        return connectLedgerStacksApp(dmk, { ...options, runAction: signerActions.run });
      },
      getAppVersion: getStacksAppVersion,
      isAppOpen: isStacksAppOpen,
      passesAdditionalVersionCheck: stacksVersionGate(ledgerNavigate),
      onSuccess() {
        toast.success('Address verified on your Ledger');
        close();
        void navigate(RouteUrls.Home, { replace: true });
      },
      async pullKeysFromDevice(app) {
        if (!stacksAccount) {
          void ledgerNavigate.toErrorStep('stacks');
          return { status: 'failure' };
        }
        const expectedAddress = stacksAccount.address;
        void ledgerNavigate.toDeviceBusyStep(
          'Confirm the address on your Ledger…',
          expectedAddress
        );
        const response = await showStxAddressOnDevice(app)(
          stacksAccount.derivationPath,
          stacksChainIdToSingleSigAddressVersion(network.chain.stacks.chainId)
        );
        if (isStxAddressResponseRejected(response)) {
          analytics.track('address_verification_completed', {
            type: 'stx',
            verified: false,
          });
          void ledgerNavigate.toErrorStep(
            'stacks',
            'Address verification was rejected on the device.'
          );
          return { status: 'failure' };
        }
        if (!isStxAddressResponseSuccess(response)) {
          analytics.track('address_verification_completed', {
            type: 'stx',
            verified: false,
          });
          void ledgerNavigate.toErrorStep('stacks', response.errorMessage);
          return { status: 'failure' };
        }
        if (!isLedgerOnDeviceAddressConfirmed(response.address, expectedAddress)) {
          analytics.track('address_verification_completed', {
            type: 'stx',
            verified: false,
          });
          void ledgerNavigate.toErrorStep(
            'stacks',
            'The address shown on your Ledger does not match the one in Leather.'
          );
          return { status: 'failure' };
        }
        analytics.track('address_verification_completed', { type: 'stx', verified: true });
        return { status: 'success' };
      },
    });

  const ledgerContextValue: LedgerRequestKeysContext = {
    chain: 'stacks',
    pullPublicKeysFromDevice: requestKeys,
    latestDeviceResponse,
    awaitingDeviceConnection,
  };

  const canCancelLedgerAction = useCancelLedgerAction({
    awaitingDeviceConnection,
    isConnectionCancellable,
  });
  return (
    <RequestKeysFlow
      context={ledgerContextValue}
      isActionCancellableByUser={canCancelLedgerAction}
      onCancelAction={signerActions.cancelActive}
    />
  );
}
