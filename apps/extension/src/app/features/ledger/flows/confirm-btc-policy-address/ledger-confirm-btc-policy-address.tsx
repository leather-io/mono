import {
  getBitcoinSigner,
  isLedgerOnDeviceAddressConfirmed,
  toLedgerDisplayedAddress,
} from '@leather.io/ledger';

import { useLedgerSteps } from '@app/features/ledger/flow/ledger-flow.context';
import type { ConfirmBtcPolicyAddressLedgerFlowRequest } from '@app/features/ledger/flow/ledger-flow.types';
import { type LedgerRequestKeysContext } from '@app/features/ledger/generic-flows/request-keys/ledger-request-keys.context';
import { RequestKeysFlow } from '@app/features/ledger/generic-flows/request-keys/request-keys-flow';
import { useRequestLedgerKeys } from '@app/features/ledger/generic-flows/request-keys/use-request-ledger-keys';
import { withInteractionHandler } from '@app/features/ledger/hardware-wallet/operation-context.utils';
import { useDisplayLedgerDescriptorAddress } from '@app/features/ledger/hooks/use-display-ledger-descriptor-address';
import { useCancelLedgerAction } from '@app/features/ledger/utils/generic-ledger-utils';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';

// Drives the on-device confirmation for btc_addAccount on a Ledger wallet. It
// reuses the generic request-keys flow (connect → version → success/error) and,
// once connected, displays the multisig `wsh` address on the device. The request
// (and so the same derived address and add/verify behaviour) is read from the
// stable popup search params via `useBtcAddAccount`, so on success this owns the
// dApp response: it finalizes (registers in add mode, returns the verified
// address in verify mode) and closes the popup.
interface LedgerConfirmBtcPolicyAddressProps {
  request: ConfirmBtcPolicyAddressLedgerFlowRequest;
}
export function LedgerConfirmBtcPolicyAddress({ request }: LedgerConfirmBtcPolicyAddressProps) {
  const ledgerNavigate = useLedgerSteps();
  const network = useCurrentNetwork();
  const { descriptor, address, onConfirmed } = request;
  const displayLedgerDescriptorAddress = useDisplayLedgerDescriptorAddress();

  function toConfirmAddressStep() {
    ledgerNavigate.toDeviceBusyStep(
      'Confirm the address on your Ledger…',
      address ? toLedgerDisplayedAddress(address) : undefined
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
      void onConfirmed();
    },
    async pullKeysFromDevice(wallet, ctx) {
      const signer = getBitcoinSigner(wallet);
      toConfirmAddressStep();
      const onDeviceAddress = await displayLedgerDescriptorAddress(
        signer,
        descriptor,
        withInteractionHandler(ctx, interaction => {
          if (interaction.type === 'verify-address') toConfirmAddressStep();
        })
      );
      if (!isLedgerOnDeviceAddressConfirmed(onDeviceAddress, address)) {
        ledgerNavigate.toErrorStep(
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
