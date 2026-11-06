import { stxSignMessageTypeSchema } from '@leather.io/rpc';

import { PopupHeader } from '@app/features/container/headers/popup.header';
import { StacksMessageSigning } from '@app/features/stacks-message-signer/stacks-message-signing';

import {
  useRpcSignStacksMessage,
  useRpcSignStacksMessageParams,
  useRpcStacksMessagePayload,
} from './use-rpc-sign-stacks-message';

export function RpcStacksMessageSigning() {
  const { requestId, messageType, tabId, origin } = useRpcSignStacksMessageParams();
  const { isLoading, signMessage, onCancelMessageSigning } = useRpcSignStacksMessage();
  const payload = useRpcStacksMessagePayload();

  if (!requestId || !tabId) return null;
  if (!stxSignMessageTypeSchema.safeParse(messageType).success) return null;
  if (!origin) return null;
  if (!payload) return null;

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
