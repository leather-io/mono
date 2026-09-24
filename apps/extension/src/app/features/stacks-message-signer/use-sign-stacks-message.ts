import { useState } from 'react';

import { logger } from '@shared/logger';
import { SignatureData, UnsignedMessage } from '@shared/signature/signature-types';
import { analytics } from '@shared/utils/analytics';

import { useWalletType } from '@app/common/use-wallet-type';
import { useLedgerFlow } from '@app/features/ledger/flow/ledger-flow.context';
import {
  improveUxWithShortDelayAsStacksSigningIsSoFast,
  useMessageSignerStacksSoftwareWallet,
} from '@app/features/stacks-message-signer/stacks-message-signing.utils';

import { listenForStacksMessageSigning } from '../ledger/flows/stacks-message-signing/stacks-message-signing-event-listeners';

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
      ledgerFlow.open({ kind: 'sign-stacks-message', message: unsignedMessage });
      try {
        const messageSignature = await listenForStacksMessageSigning(unsignedMessage);
        onSignMessageCompleted(messageSignature);
      } catch {
        onSignMessageCancelled();
      }
    },
  });

  return { isLoading, signMessage };
}
