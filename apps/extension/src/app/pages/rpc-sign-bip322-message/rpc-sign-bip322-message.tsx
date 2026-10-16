import { ChainId } from '@stacks/network';

import { truncateMiddle } from '@leather.io/utils';

import { closeWindow } from '@shared/utils';

import { Disclaimer } from '@app/components/disclaimer';
import { GenericError } from '@app/components/generic-error/generic-error';
import { NoFeesWarningRow } from '@app/components/no-fees-warning-row';
import { PopupHeader } from '@app/features/container/headers/popup.header';
import { MessagePreviewBox } from '@app/features/message-signer/message-preview-box';
import { MessageSigningRequestLayout } from '@app/features/message-signer/message-signing-request.layout';
import { AccountGate } from '@app/routes/account-gate';

import { MessageSigningHeader } from '../../features/message-signer/message-signing-header';
import { SignMessageActions } from '../../features/message-signer/stacks-sign-message-action';
import { useSignBip322Message } from './use-sign-bip322-message';

// Imported dynamically
// ts-unused-exports:disable-next-line
export function RpcSignBip322MessageRoute() {
  return (
    <AccountGate>
      <RpcSignBip322Message />
    </AccountGate>
  );
}

const paymentTypeLabels: Record<string, string> = {
  p2tr: 'Taproot',
  p2wpkh: 'Native SegWit',
};

function RpcSignBip322Message() {
  const {
    origin,
    message,
    address,
    networkMode,
    isLoading,
    paymentType,
    onSignerUnavailable,
    onUserApproveBip322MessageSigningRequest,
    onUserRejectBip322MessageSigningRequest,
  } = useSignBip322Message();

  if (origin === null) {
    closeWindow();
    throw new Error('Origin is null');
  }

  if (!address) {
    return (
      <GenericError
        title="Unable to sign message"
        body={`The current account has no ${paymentTypeLabels[paymentType] ?? paymentType} address to sign this message with.`}
        onClose={onSignerUnavailable}
      />
    );
  }

  return (
    <>
      <PopupHeader showSwitchAccount balance="all" />
      <MessageSigningRequestLayout>
        <MessageSigningHeader
          origin={origin}
          additionalText={`. This message is signed by ${truncateMiddle(address)}`}
        />
        <MessagePreviewBox message={message} />
        <NoFeesWarningRow chainId={networkMode === 'mainnet' ? ChainId.Mainnet : ChainId.Testnet} />
        <SignMessageActions
          isLoading={isLoading}
          onSignMessage={() => void onUserApproveBip322MessageSigningRequest()}
          onSignMessageCancel={() => onUserRejectBip322MessageSigningRequest()}
        />
        <hr />
        <Disclaimer
          disclaimerText="By signing this message, you prove that you own this address"
          mb="space.05"
        />
      </MessageSigningRequestLayout>
    </>
  );
}
