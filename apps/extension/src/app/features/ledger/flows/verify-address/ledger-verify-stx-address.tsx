import { useNavigate } from 'react-router';

import {
  getStacksSigner,
  isHardwareWalletErrorOfKind,
  isLedgerOnDeviceAddressConfirmed,
} from '@leather.io/ledger';
import { isError } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';
import { analytics } from '@shared/utils/analytics';

import { useLedgerFlow, useLedgerSteps } from '@app/features/ledger/flow/ledger-flow.context';
import { type LedgerRequestKeysContext } from '@app/features/ledger/generic-flows/request-keys/ledger-request-keys.context';
import { RequestKeysFlow } from '@app/features/ledger/generic-flows/request-keys/request-keys-flow';
import { useRequestLedgerKeys } from '@app/features/ledger/generic-flows/request-keys/use-request-ledger-keys';
import { useCancelLedgerAction } from '@app/features/ledger/utils/generic-ledger-utils';
import { toastDurations, useToast } from '@app/features/toasts/use-toast';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';

export function LedgerVerifyStxAddress() {
  const navigate = useNavigate();
  const toast = useToast();
  const ledgerNavigate = useLedgerSteps();
  const { close } = useLedgerFlow();
  const network = useCurrentNetwork();
  const stacksAccount = useCurrentStacksAccount();

  function trackVerificationFailed() {
    analytics.track('address_verification_completed', { type: 'stx', verified: false });
  }

  const {
    requestKeys,
    cancel,
    latestDeviceResponse,
    awaitingDeviceConnection,
    isConnectionCancellable,
  } = useRequestLedgerKeys({
    connectRequest: { chain: 'stacks' },
    onSuccess() {
      toast.success('Address verified on your Ledger', { duration: toastDurations.standard });
      close();
      void navigate(RouteUrls.Home, { replace: true });
    },
    async pullKeysFromDevice(wallet, ctx) {
      if (!stacksAccount) {
        ledgerNavigate.toErrorStep('stacks');
        return { status: 'failure' };
      }
      const stacks = getStacksSigner(wallet);
      const expectedAddress = stacksAccount.address;
      ledgerNavigate.toDeviceBusyStep('Confirm the address on your Ledger…', expectedAddress);
      try {
        const onDeviceAddress = await stacks.showAddress(
          {
            derivationPath: stacksAccount.derivationPath,
            chainId: network.chain.stacks.chainId,
          },
          ctx
        );
        if (!isLedgerOnDeviceAddressConfirmed(onDeviceAddress, expectedAddress)) {
          trackVerificationFailed();
          ledgerNavigate.toErrorStep(
            'stacks',
            'The address shown on your Ledger does not match the one in Leather.'
          );
          return { status: 'failure' };
        }
      } catch (e) {
        if (isHardwareWalletErrorOfKind(e, 'rejected')) {
          trackVerificationFailed();
          ledgerNavigate.toErrorStep('stacks', 'Address verification was rejected on the device.');
          return { status: 'failure' };
        }
        if (isHardwareWalletErrorOfKind(e, 'unknown') && isError(e)) {
          trackVerificationFailed();
          ledgerNavigate.toErrorStep('stacks', e.message);
          return { status: 'failure' };
        }
        throw e;
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
      onCancelAction={cancel}
    />
  );
}
