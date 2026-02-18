import { truncateMiddle } from '@leather.io/utils';

import { closeWindow } from '@shared/utils';

import { Disclaimer } from '@app/components/disclaimer';
import { NoFeesWarningRow } from '@app/components/no-fees-warning-row';
import { PopupHeader } from '@app/features/container/headers/popup.header';
import { MessagePreviewBox } from '@app/features/message-signer/message-preview-box';
import { MessageSigningRequestLayout } from '@app/features/message-signer/message-signing-request.layout';
import { AccountGate } from '@app/routes/account-gate';
import { Outlet } from '@app/routes/compat';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';

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

function RpcSignBip322Message() {
  const {
    origin,
    message,
    address,
    isLoading: signBip322MessageIsLoading,
    onUserApproveBip322MessageSigningRequest,
    onUserRejectBip322MessageSigningRequest,
  } = useSignBip322Message();

  const { chain } = useCurrentNetwork();

  if (origin === null) {
    closeWindow();
    throw new Error('Origin is null');
  }

  return (
    <>
      <Outlet />
      <PopupHeader showSwitchAccount balance="all" />
      <MessageSigningRequestLayout>
        <MessageSigningHeader
          origin={origin}
          additionalText={`. This message is signed by ${truncateMiddle(address)}`}
        />
        <MessagePreviewBox message={message} />
        <NoFeesWarningRow chainId={chain.stacks.chainId} />
        <SignMessageActions
          isLoading={signBip322MessageIsLoading}
          onSignMessage={() => onUserApproveBip322MessageSigningRequest()}
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
