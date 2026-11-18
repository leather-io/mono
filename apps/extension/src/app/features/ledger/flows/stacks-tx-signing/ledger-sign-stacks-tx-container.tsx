import { useMemo } from 'react';

import { deserializeTransaction } from '@stacks/transactions';

import { getStacksSigner, isHardwareWalletErrorOfKind } from '@leather.io/ledger';
import { delay, isError } from '@leather.io/utils';

import { useLedgerSteps } from '@app/features/ledger/flow/ledger-flow.context';
import type {
  ActiveLedgerSigningRequest,
  LedgerSigningFailure,
} from '@app/features/ledger/flow/ledger-flow.types';
import { type LedgerTxSigningContext } from '@app/features/ledger/generic-flows/tx-signing/ledger-sign-tx.context';
import { useCancelLedgerAction } from '@app/features/ledger/utils/generic-ledger-utils';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';

import { TxSigningFlow } from '../../generic-flows/tx-signing/tx-signing-flow';
import { useLedgerSignTx } from '../../generic-flows/tx-signing/use-ledger-sign-tx';
import { useLedgerAnalytics } from '../../hooks/use-ledger-analytics.hook';
import { useLedgerFingerprintMigration } from '../../hooks/use-ledger-fingerprint-migration';
import { ApproveSignLedgerStacksTx } from './steps/approve-sign-stacks-ledger-tx';

function toSigningFailure(error?: string): LedgerSigningFailure {
  return error === undefined ? { status: 'cancelled' } : { status: 'failed', error };
}

interface LedgerSignStacksTxContainerProps {
  request: ActiveLedgerSigningRequest<'sign-stacks-tx'>;
}
export function LedgerSignStacksTxContainer({ request }: LedgerSignStacksTxContainerProps) {
  const ledgerNavigate = useLedgerSteps();
  const ledgerAnalytics = useLedgerAnalytics();
  const account = useCurrentStacksAccount();
  const migrateFingerprintIfNeeded = useLedgerFingerprintMigration();
  const { tx: unsignedTx, settleOnRejection } = request;
  const transaction = useMemo(() => deserializeTransaction(unsignedTx), [unsignedTx]);

  const chain = 'stacks';

  const {
    signTransaction,
    cancel,
    latestDeviceResponse,
    awaitingDeviceConnection,
    isConnectionCancellable,
  } = useLedgerSignTx({
    connectRequest: { chain },
    async signTransactionWithDevice(wallet, ctx) {
      if (!account) {
        const errorMessage = 'No active account found for transaction signing';
        ledgerNavigate.toErrorStep(chain, errorMessage);
        return;
      }

      await migrateFingerprintIfNeeded(wallet, ctx);

      ledgerNavigate.toConnectionSuccessStep('stacks');
      await delay(1000);

      ledgerNavigate.toAwaitingDeviceOperation({ hasApprovedOperation: false });

      const stacks = getStacksSigner(wallet);
      const key = { derivationPath: account.derivationPath, publicKey: account.stxPublicKey };

      try {
        const signedTx = await stacks.signTransaction({ transaction, key }, ctx);

        ledgerNavigate.toAwaitingDeviceOperation({ hasApprovedOperation: true });

        await delay(1000);

        ledgerAnalytics.transactionSignedOnLedgerSuccessfully();

        ledgerNavigate.settleLedgerAction(request, { status: 'signed', value: signedTx });
      } catch (e) {
        if (isHardwareWalletErrorOfKind(e, 'cancelled')) throw e;

        if (isHardwareWalletErrorOfKind(e, 'invalid-payload')) {
          if (settleOnRejection) {
            ledgerNavigate.settleLedgerAction(request, toSigningFailure(messageOf(e)));
          } else {
            ledgerNavigate.toDevicePayloadInvalid();
          }
          return;
        }

        if (isHardwareWalletErrorOfKind(e, 'rejected')) {
          if (settleOnRejection) {
            ledgerNavigate.settleLedgerAction(request, toSigningFailure());
          } else {
            ledgerNavigate.toOperationRejectedStep();
          }
          ledgerAnalytics.transactionSignedOnLedgerRejected();
          return;
        }

        if (settleOnRejection) {
          ledgerNavigate.settleLedgerAction(request, toSigningFailure(messageOf(e)));
          return;
        }
        throw e;
      }
    },
  });

  function closeAction() {
    cancel();
    ledgerNavigate.cancelLedgerAction();
  }

  const ledgerContextValue: LedgerTxSigningContext = {
    chain,
    transaction,
    signTransaction,
    onCancelTxSigning: closeAction,
    latestDeviceResponse,
    awaitingDeviceConnection,
  };
  const canCancelLedgerAction = useCancelLedgerAction({
    awaitingDeviceConnection,
    isConnectionCancellable,
  });

  return (
    <TxSigningFlow
      context={ledgerContextValue}
      closeAction={canCancelLedgerAction ? closeAction : undefined}
      renderStep={{ 'awaiting-device-operation': <ApproveSignLedgerStacksTx /> }}
    />
  );
}

function messageOf(error: unknown): string | undefined {
  return isError(error) ? error.message : undefined;
}
