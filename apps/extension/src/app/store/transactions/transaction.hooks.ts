import { useCallback } from 'react';

import { StacksTransactionWire, TransactionSigner } from '@stacks/transactions';

import { logger } from '@shared/logger';

import { useWalletType } from '@app/common/use-wallet-type';
import { useLedgerFlow } from '@app/features/ledger/flow/ledger-flow.context';
import { listenForStacksTxLedgerSigning } from '@app/features/ledger/flows/stacks-tx-signing/stacks-tx-signing-event-listeners';
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

interface UseSignStacksTransactionOptions {
  settleOnRejection?: boolean;
}
export function useSignStacksTransaction({
  settleOnRejection = false,
}: UseSignStacksTransactionOptions = {}) {
  const { whenWallet } = useWalletType();
  const ledgerFlow = useLedgerFlow();
  const signSoftwareTx = useSignTransactionSoftwareWallet();

  return (tx: StacksTransactionWire) =>
    whenWallet({
      async ledger(tx: StacksTransactionWire) {
        const serializedTx = tx.serialize();
        ledgerFlow.open({ kind: 'sign-stacks-tx', tx: serializedTx, settleOnRejection });
        return listenForStacksTxLedgerSigning(serializedTx);
      },
      software(tx: StacksTransactionWire) {
        return signSoftwareTx(tx);
      },
    })(tx);
}
