import { useNavigate } from 'react-router';

import {
  type HardwareBitcoinSigner,
  type OperationContext,
  getBitcoinSigner,
  isHardwareWalletErrorOfKind,
  isLedgerOnDeviceAddressConfirmed,
  toLedgerDisplayedAddress,
} from '@leather.io/ledger';

import { RouteUrls } from '@shared/route-urls';
import { analytics } from '@shared/utils/analytics';

import { useLedgerFlow, useLedgerSteps } from '@app/features/ledger/flow/ledger-flow.context';
import type { VerifyAddressVariant } from '@app/features/ledger/flow/ledger-flow.types';
import { type LedgerRequestKeysContext } from '@app/features/ledger/generic-flows/request-keys/ledger-request-keys.context';
import { RequestKeysFlow } from '@app/features/ledger/generic-flows/request-keys/request-keys-flow';
import { useRequestLedgerKeys } from '@app/features/ledger/generic-flows/request-keys/use-request-ledger-keys';
import { withInteractionHandler } from '@app/features/ledger/hardware-wallet/operation-context.utils';
import { useDisplayLedgerDescriptorAddress } from '@app/features/ledger/hooks/use-display-ledger-descriptor-address';
import { useCancelLedgerAction } from '@app/features/ledger/utils/generic-ledger-utils';
import { toastDurations, useToast } from '@app/features/toasts/use-toast';
import { useCurrentAccountId } from '@app/store/accounts/account';
import { useZeroIndexTaprootAddress } from '@app/store/accounts/blockchain/bitcoin/bitcoin.hooks';
import { useCurrentAccountNativeSegwitAddressIndexZero } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';
import { useCurrentPolicy } from '@app/store/policy/policy.selectors';

const receiveAddressIndexes = { changeIndex: 0, addressIndex: 0 };

interface LedgerVerifyBtcAddressProps {
  variant: Exclude<VerifyAddressVariant, 'stx'>;
}
export function LedgerVerifyBtcAddress({ variant }: LedgerVerifyBtcAddressProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const ledgerNavigate = useLedgerSteps();
  const { close } = useLedgerFlow();
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
    ledgerNavigate.toDeviceBusyStep(
      'Confirm the address on your Ledger…',
      expectedAddress ? toLedgerDisplayedAddress(expectedAddress) : undefined
    );
  }

  async function displayAddressOnDevice(
    signer: HardwareBitcoinSigner,
    expectedAddress: string | null,
    ctx: OperationContext
  ) {
    const confirmCtx = withInteractionHandler(ctx, interaction => {
      if (interaction.type === 'verify-address') toConfirmAddressStep(expectedAddress);
    });
    if (variant === 'btcMultisig') {
      if (!bitcoinPolicy) throw new Error('No active bitcoin multisig policy to verify');
      return displayLedgerDescriptorAddress(signer, bitcoinPolicy.descriptor, confirmCtx);
    }
    return signer.showAddress(
      {
        kind: 'account',
        network: network.chain.bitcoin.mode,
        standard: variant === 'btcTaproot' ? 'taproot' : 'nativeSegwit',
        accountIndex,
        ...receiveAddressIndexes,
      },
      confirmCtx
    );
  }

  const {
    requestKeys,
    cancel,
    latestDeviceResponse,
    awaitingDeviceConnection,
    isConnectionCancellable,
  } = useRequestLedgerKeys({
    connectRequest: { chain: 'bitcoin', network: network.chain.bitcoin.mode },
    onSuccess() {
      toast.success('Address verified on your Ledger', { duration: toastDurations.standard });
      close();
      void navigate(RouteUrls.Home, { replace: true });
    },
    async pullKeysFromDevice(wallet, ctx) {
      const signer = getBitcoinSigner(wallet);
      const expectedAddress = getExpectedAddress();
      toConfirmAddressStep(expectedAddress);
      try {
        const onDeviceAddress = await displayAddressOnDevice(signer, expectedAddress, ctx);
        if (!isLedgerOnDeviceAddressConfirmed(onDeviceAddress, expectedAddress)) {
          analytics.track('address_verification_completed', {
            type: variant,
            verified: false,
          });
          ledgerNavigate.toErrorStep(
            'bitcoin',
            'The address shown on your Ledger does not match the one in Leather.'
          );
          return { status: 'failure' };
        }
      } catch (e) {
        if (isHardwareWalletErrorOfKind(e, 'locked')) throw e;
        analytics.track('address_verification_completed', {
          type: variant,
          verified: false,
        });
        ledgerNavigate.toErrorStep(
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
      onCancelAction={cancel}
    />
  );
}
