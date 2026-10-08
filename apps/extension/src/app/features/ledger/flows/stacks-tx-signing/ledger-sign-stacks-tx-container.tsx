import { deserializeTransaction } from '@stacks/transactions';
import { LedgerError } from '@zondax/ledger-stacks';

import { delay } from '@leather.io/utils';

import { makeLedgerAppResponseError } from '@app/features/ledger/dmk/ledger-dmk-errors';
import { useLedgerDmk } from '@app/features/ledger/dmk/ledger-dmk.context';
import { useLedgerSteps } from '@app/features/ledger/flow/ledger-flow.context';
import type {
  ActiveLedgerSigningRequest,
  LedgerSigningFailure,
} from '@app/features/ledger/flow/ledger-flow.types';
import { LedgerTxSigningContext } from '@app/features/ledger/generic-flows/tx-signing/ledger-sign-tx.context';
import { useSignerActionController } from '@app/features/ledger/utils/bitcoin-signer-kit-utils';
import { useCancelLedgerAction } from '@app/features/ledger/utils/generic-ledger-utils';
import type { LedgerStacksApp } from '@app/features/ledger/utils/ledger-app';
import {
  connectLedgerStacksApp,
  getStacksAppVersion,
  isStacksAppOpen,
  signLedgerStacksTransaction,
  signStacksTransactionWithSignature,
} from '@app/features/ledger/utils/stacks-ledger-utils';
import { stacksVersionGate } from '@app/features/ledger/utils/stacks-version-gate';
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
  const dmk = useLedgerDmk();
  const signerActions = useSignerActionController();
  const ledgerNavigate = useLedgerSteps();
  const ledgerAnalytics = useLedgerAnalytics();
  const account = useCurrentStacksAccount();
  const migrateFingerprintIfNeeded = useLedgerFingerprintMigration();
  const { tx: unsignedTx, settleOnRejection } = request;

  const chain = 'stacks';

  const {
    signTransaction,
    latestDeviceResponse,
    awaitingDeviceConnection,
    isConnectionCancellable,
  } = useLedgerSignTx<LedgerStacksApp>({
    chain,
    isAppOpen: isStacksAppOpen,
    getAppVersion: getStacksAppVersion,
    connectApp(options) {
      return connectLedgerStacksApp(dmk, { ...options, runAction: signerActions.run });
    },
    passesAdditionalVersionCheck: stacksVersionGate(ledgerNavigate),
    async signTransactionWithDevice(stacksApp) {
      if (!account) {
        const errorMessage = 'No active account found for transaction signing';
        ledgerNavigate.toErrorStep(chain, errorMessage);
        return;
      }

      await migrateFingerprintIfNeeded(stacksApp);

      ledgerNavigate.toConnectionSuccessStep('stacks');
      await delay(1000);

      ledgerNavigate.toAwaitingDeviceOperation({ hasApprovedOperation: false });

      const resp = await signLedgerStacksTransaction(stacksApp)(
        Buffer.from(unsignedTx, 'hex'),
        account.derivationPath
      );

      if (resp.returnCode === LedgerError.DataIsInvalid) {
        if (settleOnRejection) {
          ledgerNavigate.settleLedgerAction(request, toSigningFailure(resp.errorMessage));
        } else {
          ledgerNavigate.toDevicePayloadInvalid();
        }
        return;
      }

      if (resp.returnCode === LedgerError.TransactionRejected) {
        if (settleOnRejection) {
          ledgerNavigate.settleLedgerAction(request, toSigningFailure());
        } else {
          ledgerNavigate.toOperationRejectedStep();
        }
        ledgerAnalytics.transactionSignedOnLedgerRejected();
        return;
      }

      if (resp.returnCode !== LedgerError.NoErrors) {
        if (settleOnRejection) {
          ledgerNavigate.settleLedgerAction(request, toSigningFailure(resp.errorMessage));
          return;
        }
        throw makeLedgerAppResponseError(resp);
      }

      ledgerNavigate.toAwaitingDeviceOperation({ hasApprovedOperation: true });

      await delay(1000);

      const signedTx = signStacksTransactionWithSignature(unsignedTx, resp.signatureVRS);
      ledgerAnalytics.transactionSignedOnLedgerSuccessfully();

      ledgerNavigate.settleLedgerAction(request, { status: 'signed', value: signedTx });
    },
  });

  function closeAction() {
    signerActions.cancelActive();
    ledgerNavigate.cancelLedgerAction();
  }

  const ledgerContextValue: LedgerTxSigningContext = {
    chain,
    transaction: deserializeTransaction(unsignedTx),
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
