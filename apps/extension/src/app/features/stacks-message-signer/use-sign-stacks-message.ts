import { useState } from 'react';

import { logger } from '@shared/logger';
import { SignatureData, UnsignedMessage } from '@shared/signature/signature-types';
import { analytics } from '@shared/utils/analytics';

import { useWalletType } from '@app/common/use-wallet-type';
import { useLedgerFlow } from '@app/features/ledger/flow/ledger-flow.context';
import { unwrapLedgerSigningOutcome } from '@app/features/ledger/flow/unwrap-ledger-signing-outcome';
import {
  improveUxWithShortDelayAsStacksSigningIsSoFast,
  useMessageSignerStacksSoftwareWallet,
} from '@app/features/stacks-message-signer/stacks-message-signing.utils';

interface SignStacksMessageProps {
  onSignMessageCompleted(messageSignature: SignatureData): void;
  onSignMessageCancelled(): void;
}
export function useSignStacksMessage({
  onSignMessageCompleted,
  onSignMessageCancelled,
}: SignStacksMessageProps) {
  const signSoftwareWalletMessage = useMessageSignerStacksSoftwareWallet();

  const { whenWallet } = useWalletType();
  const ledgerFlow = useLedgerFlow();

  const [isLoading, setIsLoading] = useState(false);

  const signMessage = whenWallet({
    async software(unsignedMessage: UnsignedMessage) {
      setIsLoading(true);
      analytics.track('request_signature_sign', { type: 'software' });

      const messageSignature = signSoftwareWalletMessage(unsignedMessage);

      if (!messageSignature) {
        logger.error('Cannot sign message, no account in state');
        analytics.track('request_signature_cannot_sign_message_no_account');
        return;
      }
      await improveUxWithShortDelayAsStacksSigningIsSoFast();
      setIsLoading(false);

      onSignMessageCompleted(messageSignature);
    },

    async ledger(unsignedMessage: UnsignedMessage) {
      analytics.track('request_signature_sign', { type: 'ledger' });
      try {
        const messageSignature = unwrapLedgerSigningOutcome(
          await ledgerFlow.sign({ kind: 'sign-stacks-message', message: unsignedMessage })
        );
        if (!messageSignature) return;
        onSignMessageCompleted(messageSignature);
      } catch {
        onSignMessageCancelled();
      }
    },
  });

  return { isLoading, signMessage };
}
