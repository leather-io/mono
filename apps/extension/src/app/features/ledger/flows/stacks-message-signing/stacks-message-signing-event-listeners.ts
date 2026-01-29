import type { SignatureData } from '@stacks/connect-jwt';
import { isDeepEqual } from 'remeda';

import type { UnsignedMessage } from '@shared/signature/signature-types';

import { GlobalAppEvents, appEvents } from '@app/common/publish-subscribe';

export async function listenForStacksMessageSigning(
  unsignedMessage: UnsignedMessage
): Promise<SignatureData> {
  return new Promise((resolve, reject) => {
    function stacksMessageSignedHandler(msg: GlobalAppEvents['ledgerStacksMessageSigned']) {
      if (isDeepEqual(msg.unsignedMessage, unsignedMessage)) {
        appEvents.unsubscribe('ledgerStacksMessageSigned', stacksMessageSignedHandler);
        appEvents.unsubscribe('ledgerStacksMessageSigningCancelled', signingAbortedHandler);
        resolve(msg.messageSignatures);
      }
    }
    appEvents.subscribe('ledgerStacksMessageSigned', stacksMessageSignedHandler);

    function signingAbortedHandler(msg: GlobalAppEvents['ledgerStacksMessageSigningCancelled']) {
      if (isDeepEqual(msg.unsignedMessage, unsignedMessage)) {
        appEvents.unsubscribe('ledgerStacksMessageSigningCancelled', signingAbortedHandler);
        appEvents.unsubscribe('ledgerStacksMessageSigned', stacksMessageSignedHandler);
        reject(new Error('User cancelled the signing operation'));
      }
    }
    appEvents.subscribe('ledgerStacksMessageSigningCancelled', signingAbortedHandler);
  });
}
