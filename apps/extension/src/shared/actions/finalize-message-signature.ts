import { SignatureData } from '@stacks/connect-jwt';

import { sendMessageToOriginatingFrame } from '@shared/messaging/send-message-to-originating-frame';
import { closeWindow } from '@shared/utils';

import { formatMessageSigningResponse } from './finalize-message-signature-format';

interface FinalizeMessageSignatureArgs {
  requestPayload: string;
  frameId: number;
  tabId: number;
  data: SignatureData | string;
}
export function finalizeMessageSignature({
  requestPayload,
  data,
  frameId,
  tabId,
}: FinalizeMessageSignatureArgs) {
  const responseMessage = formatMessageSigningResponse({ request: requestPayload, response: data });
  void sendMessageToOriginatingFrame({ frameId, tabId }, responseMessage);
  closeWindow();
}
