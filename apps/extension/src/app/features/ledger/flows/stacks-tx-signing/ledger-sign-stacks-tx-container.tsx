import { useEffect, useState } from 'react';
import { Route, useLocation } from 'react-router';

import { deserializeTransaction } from '@stacks/transactions';
import StacksApp, { LedgerError } from '@zondax/ledger-stacks';
import get from 'lodash.get';

import { delay, isError } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';
import { analytics } from '@shared/utils/analytics';

import { useLocationStateWithCache } from '@app/common/hooks/use-location-state';
import { useScrollLock } from '@app/common/hooks/use-scroll-lock';
import { appEvents } from '@app/common/publish-subscribe';
import { LedgerTxSigningContext } from '@app/features/ledger/generic-flows/tx-signing/ledger-sign-tx.context';
import { useCancelLedgerAction } from '@app/features/ledger/utils/generic-ledger-utils';
import {
  connectLedgerStacksApp,
  getStacksAppVersion,
  isStacksAppOpen,
  signLedgerStacksTransaction,
  signStacksTransactionWithSignature,
} from '@app/features/ledger/utils/stacks-ledger-utils';
import { stacksVersionGate } from '@app/features/ledger/utils/stacks-version-gate';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';

import { ledgerSignTxRoutes } from '../../generic-flows/tx-signing/ledger-sign-tx-route-generator';
import { TxSigningFlow } from '../../generic-flows/tx-signing/tx-signing-flow';
import { useLedgerSignTx } from '../../generic-flows/tx-signing/use-ledger-sign-tx';
import { useLedgerAnalytics } from '../../hooks/use-ledger-analytics.hook';
import { useLedgerFingerprintMigration } from '../../hooks/use-ledger-fingerprint-migration';
import { useLedgerNavigate } from '../../hooks/use-ledger-navigate';
import { ApproveSignLedgerStacksTx } from './steps/approve-sign-stacks-ledger-tx';

export const ledgerStacksTxSigningRoutes = ledgerSignTxRoutes({
  component: <LedgerSignStacksTxContainer />,
  customRoutes: (
    <Route path={RouteUrls.AwaitingDeviceUserAction} element={<ApproveSignLedgerStacksTx />} />
  ),
});

function publishStacksSigningSettled(unsignedTx: string, error?: string) {
  appEvents.publish(
    'ledgerStacksTxSigningCancelled',
    error === undefined ? { unsignedTx } : { unsignedTx, error }
  );
}

function LedgerSignStacksTxContainer() {
  const location = useLocation();
  const ledgerNavigate = useLedgerNavigate();
  const ledgerAnalytics = useLedgerAnalytics();
  useScrollLock(true);
  const account = useCurrentStacksAccount();
  const migrateFingerprintIfNeeded = useLedgerFingerprintMigration();
  const [unsignedTx, setUnsignedTx] = useState<null | string>(null);
  const settleOnRejection = useLocationStateWithCache<boolean>('settleOnRejection');

  const chain = 'stacks';

  useEffect(() => {
    const tx = get(location.state, 'tx');
    if (tx) setUnsignedTx(tx);
  }, [location.state]);

  useEffect(() => () => setUnsignedTx(null), []);

  const { signTransaction, latestDeviceResponse, awaitingDeviceConnection } =
    useLedgerSignTx<StacksApp>({
      chain,
      isAppOpen: isStacksAppOpen,
      getAppVersion: getStacksAppVersion,
      connectApp: connectLedgerStacksApp,
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

        if (!unsignedTx) throw new Error('No unsigned tx');

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
          throw new Error('Some other error');
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
    appEvents.publish('ledgerStacksTxSigningCancelled', { unsignedTx: unsignedTx ?? '' });
    void ledgerNavigate.cancelLedgerAction();
  }

  const ledgerContextValue: LedgerTxSigningContext = {
    chain,
    transaction: unsignedTx ? deserializeTransaction(unsignedTx) : null,
    signTransaction,
    onCancelTxSigning: closeAction,
    latestDeviceResponse,
    awaitingDeviceConnection,
  };
  const canCancelLedgerAction = useCancelLedgerAction(awaitingDeviceConnection);

  return (
    <TxSigningFlow
      context={ledgerContextValue}
      closeAction={canCancelLedgerAction ? closeAction : undefined}
    />
  );
}
