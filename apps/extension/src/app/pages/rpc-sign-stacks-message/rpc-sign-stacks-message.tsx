import { isSignableMessageType } from '@shared/signature/signature-types';

import { PopupHeader } from '@app/features/container/headers/popup.header';
import { SignMessageMissingAccountError } from '@app/features/message-signer/sign-message-missing-account-error';
import { StacksMessageSigning } from '@app/features/stacks-message-signer/stacks-message-signing';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';

import {
  useRpcSignStacksMessage,
  useRpcSignStacksMessageParams,
  useRpcStacksMessagePayload,
} from './use-rpc-sign-stacks-message';

export function RpcStacksMessageSigning() {
  const { requestId, messageType, tabId, origin } = useRpcSignStacksMessageParams();
  const { isLoading, signMessage, onCancelMessageSigning } = useRpcSignStacksMessage();
  const payload = useRpcStacksMessagePayload();
  const currentStacksAccount = useCurrentStacksAccount();

  if (!requestId || !tabId) return null;
  if (!isSignableMessageType(messageType)) return null;
  if (!origin) return null;
  if (!payload) return null;
  if (!currentStacksAccount) return <SignMessageMissingAccountError chain="stacks" />;

  return (
    <>
      <PopupHeader showSwitchAccount balance="stx" />
      <StacksMessageSigning
        payload={payload}
        isLoading={isLoading}
        onSignMessage={signMessage}
        onCancelMessageSigning={onCancelMessageSigning}
        messageType={messageType}
        tabId={tabId}
        origin={origin}
      />
    </>
  );
}
