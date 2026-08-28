import { useNavigate } from 'react-router';

import StacksApp, { ResponseAddress } from '@zondax/ledger-stacks';

import { deriveStxMultisigAddress } from '@leather.io/stacks';

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
  MINIMUM_STACKS_APP_VERSION,
  MINIMUM_STACKS_APP_VERSION_MULTISIG_ADDRESS,
  connectLedgerStacksApp,
  getStacksAppVersion,
  isStacksAppOpen,
  isStxAddressResponseRejected,
  isStxAddressResponseSuccess,
  makeStxMultisigAddressOptions,
  showStxAddressOnDevice,
  showStxMultisigAddressOnDevice,
  stacksChainIdToMultiSigAddressVersion,
  stacksChainIdToSingleSigAddressVersion,
} from '@app/features/ledger/utils/stacks-ledger-utils';
import { stacksVersionGate } from '@app/features/ledger/utils/stacks-version-gate';
import { useToast } from '@app/features/toasts/use-toast';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import type { StacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.models';
import { useCurrentNetwork, useNetworks } from '@app/store/networks/networks.selectors';
import { useCurrentPolicy } from '@app/store/policy/policy.selectors';

import { verifyAddressPaths } from './verify-address-paths';

type ShowAddressOutcome =
  | { status: 'shown'; response: ResponseAddress }
  | { status: 'error'; message: string };

interface LedgerVerifyStxAddressProps {
  variant: 'stx' | 'stxMultisig';
}
function LedgerVerifyStxAddress({ variant }: LedgerVerifyStxAddressProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const ledgerNavigate = useLedgerNavigate();
  const network = useCurrentNetwork();
  const networks = useNetworks();
  const stacksAccount = useCurrentStacksAccount();
  const policy = useCurrentPolicy();

  const stacksPolicy = policy?.chain === 'stacks' ? policy : undefined;
  const minimumAppVersion =
    variant === 'stxMultisig'
      ? MINIMUM_STACKS_APP_VERSION_MULTISIG_ADDRESS
      : MINIMUM_STACKS_APP_VERSION;

  function getExpectedAddress() {
    if (variant === 'stxMultisig') return stacksPolicy?.address ?? null;
    return stacksAccount?.address ?? null;
  }

  async function showAddressOnDevice(
    app: StacksApp,
    account: StacksAccount
  ): Promise<ShowAddressOutcome> {
    if (variant !== 'stxMultisig') {
      const response = await showStxAddressOnDevice(app)(
        account.derivationPath,
        stacksChainIdToSingleSigAddressVersion(network.chain.stacks.chainId)
      );
      return { status: 'shown', response };
    }
    if (!stacksPolicy) {
      return { status: 'error', message: 'No active Stacks multisig account to verify.' };
    }
    const chainId =
      networks[stacksPolicy.networkId]?.chain.stacks.chainId ?? network.chain.stacks.chainId;
    const derivedAddress = deriveStxMultisigAddress({
      publicKeys: stacksPolicy.publicKeys,
      threshold: stacksPolicy.threshold,
      chainId,
    });
    if (derivedAddress !== stacksPolicy.address) {
      return {
        status: 'error',
        message: 'Could not derive the multisig address for this account.',
      };
    }
    const optionsResult = makeStxMultisigAddressOptions({
      publicKeys: stacksPolicy.publicKeys,
      threshold: stacksPolicy.threshold,
      devicePublicKey: account.stxPublicKey,
    });
    if (optionsResult.status === 'error') return optionsResult;
    const response = await showStxMultisigAddressOnDevice(app)(
      account.derivationPath,
      stacksChainIdToMultiSigAddressVersion(chainId),
      optionsResult.options
    );
    return { status: 'shown', response };
  }

  const { requestKeys, latestDeviceResponse, awaitingDeviceConnection } =
    useRequestLedgerKeys<StacksApp>({
      chain: 'stacks',
      connectApp: connectLedgerStacksApp,
      getAppVersion: getStacksAppVersion,
      isAppOpen: isStacksAppOpen,
      passesAdditionalVersionCheck: stacksVersionGate(ledgerNavigate, minimumAppVersion),
      onSuccess() {
        toast.success('Address verified on your Ledger');
        void navigate(RouteUrls.Home, { replace: true });
      },
      async pullKeysFromDevice(app) {
        function fail(message?: string): { status: 'failure' } {
          analytics.track('address_verification_completed', { type: variant, verified: false });
          void ledgerNavigate.toErrorStep('stacks', message);
          return { status: 'failure' };
        }
        const expectedAddress = getExpectedAddress();
        if (!stacksAccount || !expectedAddress) {
          void ledgerNavigate.toErrorStep('stacks');
          return { status: 'failure' };
        }
        void ledgerNavigate.toDeviceBusyStep(
          'Confirm the address on your Ledger…',
          expectedAddress
        );
        const outcome = await showAddressOnDevice(app, stacksAccount);
        if (outcome.status === 'error') return fail(outcome.message);
        if (isStxAddressResponseRejected(outcome.response)) {
          return fail('Address verification was rejected on the device.');
        }
        if (!isStxAddressResponseSuccess(outcome.response)) {
          return fail(outcome.response.errorMessage);
        }
        if (!isLedgerOnDeviceAddressConfirmed(outcome.response.address, expectedAddress)) {
          return fail('The address shown on your Ledger does not match the one in Leather.');
        }
        analytics.track('address_verification_completed', { type: variant, verified: true });
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

export const verifyStxAddressRoutes = (
  <>
    {ledgerRequestKeysRoutes({
      path: verifyAddressPaths.stx,
      component: <LedgerVerifyStxAddress variant="stx" />,
    })}
    {ledgerRequestKeysRoutes({
      path: verifyAddressPaths.stxMultisig,
      component: <LedgerVerifyStxAddress variant="stxMultisig" />,
    })}
  </>
);
