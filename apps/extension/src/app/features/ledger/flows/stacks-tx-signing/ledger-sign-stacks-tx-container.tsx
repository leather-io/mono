import { deserializeTransaction } from '@stacks/transactions';
import { LedgerError } from '@zondax/ledger-stacks';

import { delay, isError } from '@leather.io/utils';

import { analytics } from '@shared/utils/analytics';

import { appEvents } from '@app/common/publish-subscribe';
import { makeLedgerAppResponseError } from '@app/features/ledger/dmk/ledger-dmk-errors';
import { useLedgerDmk } from '@app/features/ledger/dmk/ledger-dmk.context';
import { useLedgerSteps } from '@app/features/ledger/flow/ledger-flow.context';
import type { SignStacksTxLedgerFlowRequest } from '@app/features/ledger/flow/ledger-flow.types';
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

function publishStacksSigningSettled(unsignedTx: string, error?: string) {
  appEvents.publish(
    'ledgerStacksTxSigningCancelled',
    error === undefined ? { unsignedTx } : { unsignedTx, error }
  );
}

interface LedgerSignStacksTxContainerProps {
  request: SignStacksTxLedgerFlowRequest;
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
        void ledgerNavigate.toErrorStep(chain, errorMessage);
        return;
      }

      await migrateFingerprintIfNeeded(stacksApp);

      void ledgerNavigate.toConnectionSuccessStep('stacks');
      await delay(1000);

      void ledgerNavigate.toAwaitingDeviceOperation({ hasApprovedOperation: false });

      const resp = await signLedgerStacksTransaction(stacksApp)(
        Buffer.from(unsignedTx, 'hex'),
        account.derivationPath
      );

      if (resp.returnCode === LedgerError.DataIsInvalid) {
        if (settleOnRejection) {
          publishStacksSigningSettled(unsignedTx, resp.errorMessage);
        } else {
          void ledgerNavigate.toDevicePayloadInvalid();
        }
        return;
      }

      if (resp.returnCode === LedgerError.TransactionRejected) {
        if (settleOnRejection) {
          publishStacksSigningSettled(unsignedTx);
        } else {
          void ledgerNavigate.toOperationRejectedStep();
        }
        ledgerAnalytics.transactionSignedOnLedgerRejected();
        return;
      }

      if (resp.returnCode !== LedgerError.NoErrors) {
        if (settleOnRejection) {
          publishStacksSigningSettled(unsignedTx, resp.errorMessage);
          return;
        }
        throw makeLedgerAppResponseError(resp);
      }

      void ledgerNavigate.toAwaitingDeviceOperation({ hasApprovedOperation: true });

      await delay(1000);

      const signedTx = signStacksTransactionWithSignature(unsignedTx, resp.signatureVRS);
      ledgerAnalytics.transactionSignedOnLedgerSuccessfully();

      try {
        appEvents.publish('ledgerStacksTxSigned', {
          unsignedTx,
          signedTx,
        });
      } catch (e) {
        const error = isError(e) ? e.message : 'Unknown error';
        analytics.track('ledger_transaction_publish_error', {
          error: {
            message: error,
            error: e,
          },
        });

        void ledgerNavigate.toBroadcastErrorStep(error);
        return;
      }
    },
  });

  function closeAction() {
    signerActions.cancelActive();
    appEvents.publish('ledgerStacksTxSigningCancelled', { unsignedTx });
    void ledgerNavigate.cancelLedgerAction();
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
