import { Stack, styled } from 'leather-styles/jsx';

import contractCallCapture from '../captures/01-stx-call-contract.png';
import signTransactionCapture from '../captures/04-stx-sign-transaction.png';
import stacksTransferCapture from '../captures/06-stx-transfer-stx.png';
import bitcoinTransferCapture from '../captures/07-send-transfer.png';
import connectCapture from '../captures/08-get-addresses.png';
import stacksMessageCapture from '../captures/09-stx-sign-message.png';
import bitcoinMessageCapture from '../captures/10-sign-message-bip322.png';
import type { JourneyStep } from './journey-types';

interface JourneyReferenceProps {
  step: JourneyStep;
}

function referenceFor(step: JourneyStep) {
  if (step.kind === 'connect') return connectCapture;
  if (step.kind === 'message') {
    return step.chain === 'bitcoin' ? bitcoinMessageCapture : stacksMessageCapture;
  }
  if (step.method.includes('SIP-018')) return stacksMessageCapture;
  if (step.method.includes('stx_signTransaction')) return signTransactionCapture;
  if (step.method.includes('stx_transferStx')) {
    return stacksTransferCapture;
  }
  if (step.chain === 'bitcoin') return bitcoinTransferCapture;
  if (step.method.includes('callContract') || step.method.includes('contract call')) {
    return contractCallCapture;
  }
  return undefined;
}

export function JourneyReference({ step }: JourneyReferenceProps) {
  const reference = referenceFor(step);
  return (
    <Stack gap="space.03" width="100%" maxWidth="390px" minWidth="0">
      <styled.p textStyle="label.03">Current wallet · historical reference capture</styled.p>
      {reference ? (
        <styled.img
          src={reference}
          alt={`Historical current-wallet reference for ${step.method}`}
          display="block"
          width="100%"
          height="auto"
          borderWidth={1}
          borderColor="ink.border-default"
          borderRadius="sm"
        />
      ) : (
        <styled.p textStyle="caption.01" color="ink.text-subdued">
          No matching historical capture for this step.
        </styled.p>
      )}
      <styled.p textStyle="caption.01" color="ink.text-subdued">
        Static reference; not an interactive baseline or identical request. Proposed view stays
        live.
      </styled.p>
    </Stack>
  );
}
