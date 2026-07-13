import { logger } from '@shared/logger';
import { TxResult } from '@shared/message-types';
import { sendMessageToOriginatingFrame } from '@shared/messaging/send-message-to-originating-frame';
import { closeWindow } from '@shared/utils';
import { analytics } from '@shared/utils/analytics';

import { formatTxSignatureResponse } from './finalize-tx-signature-format';

interface FinalizeTxSignatureArgs {
  requestPayload: string;
  data: TxResult | 'cancel';
  frameId: number;
  tabId: number;
}

export function finalizeTxSignature({
  requestPayload,
  data,
  frameId,
  tabId,
}: FinalizeTxSignatureArgs) {
  try {
    const responseMessage = formatTxSignatureResponse({ payload: requestPayload, response: data });
    void sendMessageToOriginatingFrame({ frameId, tabId }, responseMessage);
    closeWindow();
  } catch (e) {
    // EXPERIMENT:
    // My own testing shows that `sendMessage` doesn't throw yet users have
    // reported these errors. Tracking here to see if we are able to detect this
    // happening.
    analytics?.track('finalize_tx_signature_error_thrown', { data: e });
    logger.error('Error in finalising tx signature', e);
  }
}
