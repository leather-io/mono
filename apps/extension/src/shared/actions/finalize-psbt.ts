import { PsbtData } from '@stacks/connect-jwt';

import { ExternalMethods, MESSAGE_SOURCE, PsbtResponseMessage } from '@shared/message-types';
import { sendMessageToOriginatingFrame } from '@shared/messaging/send-message-to-originating-frame';
import { closeWindow } from '@shared/utils';

interface FormatPsbtResponseArgs {
  request: string;
  response: PsbtData | string;
}
export function formatPsbtResponse({
  request,
  response,
}: FormatPsbtResponseArgs): PsbtResponseMessage {
  return {
    source: MESSAGE_SOURCE,
    method: ExternalMethods.psbtResponse,
    payload: {
      psbtRequest: request,
      psbtResponse: response,
    },
  };
}

interface FinalizePsbtArgs {
  data: PsbtData | string;
  frameId: number;
  requestPayload: string;
  tabId: number;
}
export function finalizePsbt({ data, frameId, requestPayload, tabId }: FinalizePsbtArgs) {
  const responseMessage = formatPsbtResponse({ request: requestPayload, response: data });
  void sendMessageToOriginatingFrame({ frameId, tabId }, responseMessage);
  closeWindow();
}
