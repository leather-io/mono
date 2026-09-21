import { useNavigate } from 'react-router';

import { RouteUrls } from '@shared/route-urls';
import { analytics } from '@shared/utils/analytics';

import { isLedgerDeviceLockedError } from '@app/features/ledger/dmk/ledger-dmk-errors';
import { useLedgerDmk } from '@app/features/ledger/dmk/ledger-dmk.context';
import { ledgerRequestKeysRoutes } from '@app/features/ledger/generic-flows/request-keys/ledger-request-keys-route-generator';
import { LedgerRequestKeysContext } from '@app/features/ledger/generic-flows/request-keys/ledger-request-keys.context';
import { RequestKeysFlow } from '@app/features/ledger/generic-flows/request-keys/request-keys-flow';
import { useRequestLedgerKeys } from '@app/features/ledger/generic-flows/request-keys/use-request-ledger-keys';
import { useDisplayLedgerDescriptorAddress } from '@app/features/ledger/hooks/use-display-ledger-descriptor-address';
import { useLedgerNavigate } from '@app/features/ledger/hooks/use-ledger-navigate';
import {
  connectLedgerBitcoinApp,
  displayNativeSegwitAddressOnDevice,
  displayTaprootAddressOnDevice,
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
import { useToast } from '@app/features/toasts/use-toast';
import { useCurrentAccountId } from '@app/store/accounts/account';
import { useZeroIndexTaprootAddress } from '@app/store/accounts/blockchain/bitcoin/bitcoin.hooks';
import { useCurrentAccountNativeSegwitAddressIndexZero } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';
import { useCurrentPolicy } from '@app/store/policy/policy.selectors';

import { verifyAddressPaths } from './verify-address-paths';

interface LedgerVerifyBtcAddressProps {
  variant: 'btcNativeSegwit' | 'btcTaproot' | 'btcMultisig';
}
function LedgerVerifyBtcAddress({ variant }: LedgerVerifyBtcAddressProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const dmk = useLedgerDmk();
  const signerActions = useSignerActionController();
  const ledgerNavigate = useLedgerNavigate();
  const network = useCurrentNetwork();
  const { accountIndex } = useCurrentAccountId();
  const nativeSegwitAddress = useCurrentAccountNativeSegwitAddressIndexZero();
  const taprootAddress = useZeroIndexTaprootAddress();
  const policy = useCurrentPolicy();
  const displayLedgerDescriptorAddress = useDisplayLedgerDescriptorAddress();

  const bitcoinPolicy = policy?.chain === 'bitcoin' ? policy : undefined;

  function getExpectedAddress() {
    if (variant === 'btcMultisig') return bitcoinPolicy?.address ?? null;
    if (variant === 'btcTaproot') return taprootAddress;
    return nativeSegwitAddress;
  }

  function toConfirmAddressStep(expectedAddress: string | null) {
    void ledgerNavigate.toDeviceBusyStep(
      'Confirm the address on your Ledger…',
      expectedAddress ? toLedgerDisplayedAddress(expectedAddress) : undefined
    );
  }

  async function displayAddressOnDevice(app: LedgerBitcoinApp, expectedAddress: string | null) {
    if (variant === 'btcMultisig') {
      if (!bitcoinPolicy) throw new Error('No active bitcoin multisig policy to verify');
      return displayLedgerDescriptorAddress(app, bitcoinPolicy.descriptor, {
        onWalletRegistered() {
          toConfirmAddressStep(expectedAddress);
        },
      });
    }
    const args = { network: network.chain.bitcoin.mode, accountIndex };
    if (variant === 'btcTaproot') return displayTaprootAddressOnDevice(app)(args);
    return displayNativeSegwitAddressOnDevice(app)(args);
  }

  const { requestKeys, latestDeviceResponse, awaitingDeviceConnection, isConnectionCancellable } =
    useRequestLedgerKeys<LedgerBitcoinApp>({
      chain: 'bitcoin',
      connectApp: connectLedgerBitcoinApp(dmk, network.chain.bitcoin.mode, signerActions.run),
      getAppVersion: getBitcoinAppVersion(dmk),
      isAppOpen: isBitcoinAppOpen({ network: network.chain.bitcoin.mode }),
      onSuccess() {
        toast.success('Address verified on your Ledger');
        void navigate(RouteUrls.Home, { replace: true });
      },
      async pullKeysFromDevice(app) {
        const expectedAddress = getExpectedAddress();
        toConfirmAddressStep(expectedAddress);
        try {
          const onDeviceAddress = await displayAddressOnDevice(app, expectedAddress);
          if (!isLedgerOnDeviceAddressConfirmed(onDeviceAddress, expectedAddress)) {
            analytics.track('address_verification_completed', {
              type: variant,
              verified: false,
            });
            void ledgerNavigate.toErrorStep(
              'bitcoin',
              'The address shown on your Ledger does not match the one in Leather.'
            );
            return { status: 'failure' };
          }
        } catch (e) {
          if (isLedgerDeviceLockedError(e)) throw e;
          analytics.track('address_verification_completed', {
            type: variant,
            verified: false,
          });
          void ledgerNavigate.toErrorStep(
            'bitcoin',
            'Address verification was not completed on the device.'
          );
          return { status: 'failure' };
        }
        analytics.track('address_verification_completed', { type: variant, verified: true });
        return { status: 'success' };
      },
    });

  const ledgerContextValue: LedgerRequestKeysContext = {
    chain: 'bitcoin',
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

export const verifyBtcAddressRoutes = (
  <>
    {ledgerRequestKeysRoutes({
      path: verifyAddressPaths.btcNativeSegwit,
      component: <LedgerVerifyBtcAddress variant="btcNativeSegwit" />,
    })}
    {ledgerRequestKeysRoutes({
      path: verifyAddressPaths.btcTaproot,
      component: <LedgerVerifyBtcAddress variant="btcTaproot" />,
    })}
    {ledgerRequestKeysRoutes({
      path: verifyAddressPaths.btcMultisig,
      component: <LedgerVerifyBtcAddress variant="btcMultisig" />,
    })}
  </>
);
