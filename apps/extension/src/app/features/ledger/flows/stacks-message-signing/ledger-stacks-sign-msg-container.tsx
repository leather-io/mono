import { useEffect } from 'react';

import { getStacksSigner, isHardwareWalletErrorOfKind } from '@leather.io/ledger';
import { delay } from '@leather.io/utils';

import { whenSignableMessageOfType } from '@shared/signature/signature-types';

import { LedgerFlowSheet } from '@app/features/ledger/flow/ledger-flow-sheet';
import { useLedgerFlow, useLedgerSteps } from '@app/features/ledger/flow/ledger-flow.context';
import type { ActiveLedgerSigningRequest } from '@app/features/ledger/flow/ledger-flow.types';
import { useHardwareWalletOperation } from '@app/features/ledger/hardware-wallet/use-hardware-wallet-operation';
import { useCancelLedgerAction } from '@app/features/ledger/utils/generic-ledger-utils';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { type StacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.models';

import { useLedgerAnalytics } from '../../hooks/use-ledger-analytics.hook';
import { useLedgerFingerprintMigration } from '../../hooks/use-ledger-fingerprint-migration';
import {
  type LedgerMessageSigningContext,
  LedgerMsgSigningProvider,
} from './ledger-stacks-sign-msg.context';
import { ConnectLedgerSignMsg } from './steps/connect-ledger-sign-msg';
import { OutdatedStacksAppWarningMsgSigning } from './steps/outdated-stacks-app-warning-msg-signing';
import { SignLedgerMessage } from './steps/sign-stacks-ledger-message';

const noStacksAccountErrorMessage = 'No active account found for message signing';
const checkingAppVersionDelayMs = 1_000;

interface LedgerSignMsgProps {
  account: StacksAccount;
  request: ActiveLedgerSigningRequest<'sign-stacks-message'>;
}
function LedgerSignStacksMsg({ account, request }: LedgerSignMsgProps) {
  const { message: unsignedMessage } = request;
  const ledgerNavigate = useLedgerSteps();
  const ledgerAnalytics = useLedgerAnalytics();
  const migrateFingerprintIfNeeded = useLedgerFingerprintMigration();

  const chain = 'stacks';

  const {
    run: signMessage,
    cancel,
    latestDeviceResponse,
    awaitingDeviceConnection,
    isConnectionCancellable,
  } = useHardwareWalletOperation({
    connectRequest: { chain },
    checkingAppVersionDelayMs,
    async operation(wallet, ctx, session) {
      if (session.app) ledgerAnalytics.trackDeviceVersionInfo(session.app);

      // Migrate fingerprint if needed (one-time)
      await migrateFingerprintIfNeeded(wallet, ctx);

      ledgerNavigate.toAwaitingDeviceOperation({ hasApprovedOperation: false });

      const stacks = getStacksSigner(wallet);
      const key = { derivationPath: account.derivationPath, publicKey: account.stxPublicKey };

      try {
        const signature = await whenSignableMessageOfType(unsignedMessage)({
          async utf8(msg) {
            return stacks.signMessage({ message: msg, key }, ctx);
          },
          async structured(domain, msg) {
            return stacks.signStructuredMessage({ message: msg, domain, key }, ctx);
          },
        });

        ledgerNavigate.toAwaitingDeviceOperation({ hasApprovedOperation: true });
        await delay(1000);

        ledgerAnalytics.messageSignedOnLedgerSuccessfully();

        ledgerNavigate.settleLedgerAction(request, { status: 'signed', value: signature });
      } catch (e) {
        // Assuming here that public keys are wrong. Alternatively, we may want
        // to proactively check the key before signing
        if (isHardwareWalletErrorOfKind(e, 'invalid-payload')) {
          ledgerNavigate.toDevicePayloadInvalid();
          return;
        }

        if (isHardwareWalletErrorOfKind(e, 'rejected')) {
          ledgerNavigate.toOperationRejectedStep(`Message signing operation rejected`);
          ledgerAnalytics.messageSignedOnLedgerRejected();
          ledgerNavigate.settleLedgerAction(request, { status: 'cancelled' });
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

  const ledgerContextValue: LedgerMessageSigningContext = {
    message: unsignedMessage,
    signMessage,
    onCancelMessageSigning: closeAction,
    latestDeviceResponse,
    awaitingDeviceConnection,
  };
  const canCancelLedgerAction = useCancelLedgerAction({
    awaitingDeviceConnection,
    isConnectionCancellable,
  });

  return (
    <LedgerMsgSigningProvider value={ledgerContextValue}>
      <LedgerFlowSheet
        onClose={canCancelLedgerAction ? closeAction : undefined}
        renderStep={{
          connect: <ConnectLedgerSignMsg />,
          'awaiting-device-operation': <SignLedgerMessage />,
          'outdated-stacks-app': <OutdatedStacksAppWarningMsgSigning />,
        }}
      />
    </LedgerMsgSigningProvider>
  );
}

interface LedgerSignMsgContainerProps {
  request: ActiveLedgerSigningRequest<'sign-stacks-message'>;
}
export function LedgerSignMsgContainer({ request }: LedgerSignMsgContainerProps) {
  const account = useCurrentStacksAccount();
  const { closeWithError } = useLedgerFlow();

  useEffect(() => {
    if (!account) closeWithError(noStacksAccountErrorMessage);
  }, [account, closeWithError]);

  if (!account) return null;
  return <LedgerSignStacksMsg account={account} request={request} />;
}
