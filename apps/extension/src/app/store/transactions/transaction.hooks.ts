import { useCallback } from 'react';

import { StacksTransactionWire, TransactionSigner } from '@stacks/transactions';

import { logger } from '@shared/logger';

import { useWalletType } from '@app/common/use-wallet-type';
import { listenForStacksTxLedgerSigning } from '@app/features/ledger/flows/stacks-tx-signing/stacks-tx-signing-event-listeners';
import { useLedgerNavigate } from '@app/features/ledger/hooks/use-ledger-navigate';
import { useToast } from '@app/features/toasts/use-toast';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';

function useSignTransactionSoftwareWallet() {
  const toast = useToast();
  const account = useCurrentStacksAccount();

  return useCallback(
    (tx: StacksTransactionWire) => {
      if (account?.type !== 'software') {
        [toast.error, logger.error].forEach(fn =>
          fn('Cannot use this method to sign a non-software wallet transaction')
        );
        return;
      }
      if (!account) return null;
      const signer = new TransactionSigner(tx);
      signer.signOrigin(account.stxPrivateKey);
      return tx;
    },
    [account, toast.error]
  );
}

export function useSignStacksTransaction() {
  const { whenWallet } = useWalletType();
  const ledgerNavigate = useLedgerNavigate();
  const signSoftwareTx = useSignTransactionSoftwareWallet();

  return (tx: StacksTransactionWire) =>
    whenWallet({
      async ledger(tx: StacksTransactionWire) {
        const serializedTx = tx.serialize();
        void ledgerNavigate.toConnectAndSignStacksTransactionStep(serializedTx);
        return listenForStacksTxLedgerSigning(serializedTx);
      },
      software(tx: StacksTransactionWire) {
        return signSoftwareTx(tx);
      },
    })(tx);
}
