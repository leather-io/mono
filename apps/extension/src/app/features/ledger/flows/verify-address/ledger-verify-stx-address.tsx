import { useNavigate } from 'react-router';

import StacksApp from '@zondax/ledger-stacks';

import { RouteUrls } from '@shared/route-urls';
import { analytics } from '@shared/utils/analytics';

import { ledgerRequestKeysRoutes } from '@app/features/ledger/generic-flows/request-keys/ledger-request-keys-route-generator';
import { LedgerRequestKeysContext } from '@app/features/ledger/generic-flows/request-keys/ledger-request-keys.context';
import { RequestKeysFlow } from '@app/features/ledger/generic-flows/request-keys/request-keys-flow';
import { useRequestLedgerKeys } from '@app/features/ledger/generic-flows/request-keys/use-request-ledger-keys';
import { useLedgerNavigate } from '@app/features/ledger/hooks/use-ledger-navigate';
import { useCancelLedgerAction } from '@app/features/ledger/utils/generic-ledger-utils';
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
import { useToast } from '@app/features/toasts/use-toast';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';

import { verifyAddressPaths } from './verify-address-paths';

function LedgerVerifyStxAddress() {
  const navigate = useNavigate();
  const toast = useToast();
  const ledgerNavigate = useLedgerNavigate();
  const network = useCurrentNetwork();
  const stacksAccount = useCurrentStacksAccount();

  const { requestKeys, latestDeviceResponse, awaitingDeviceConnection } =
    useRequestLedgerKeys<StacksApp>({
      chain: 'stacks',
      connectApp: connectLedgerStacksApp,
      getAppVersion: getStacksAppVersion,
      isAppOpen: isStacksAppOpen,
      onSuccess() {
        toast.success('Address verified on your Ledger');
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
          stacksAccount.index,
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
    outdatedAppVersionWarning: false,
  };

  const canCancelLedgerAction = useCancelLedgerAction(awaitingDeviceConnection);
  return (
    <RequestKeysFlow
      context={ledgerContextValue}
      isActionCancellableByUser={canCancelLedgerAction}
    />
  );
}

export const verifyStxAddressRoutes = ledgerRequestKeysRoutes({
  path: verifyAddressPaths.stx,
  component: <LedgerVerifyStxAddress />,
});
