import { useState } from 'react';

import { UserInteractionRequired } from '@ledgerhq/device-management-kit';
import { signatureVrsToRsv } from '@stacks/common';
import { serializeCV } from '@stacks/transactions';
import { LedgerError } from '@zondax/ledger-stacks';

import { delay } from '@leather.io/utils';

import { UnsignedMessage, whenSignableMessageOfType } from '@shared/signature/signature-types';

import { appEvents } from '@app/common/publish-subscribe';
import { safeAwait } from '@app/common/utils/safe-await';
import {
  handleLedgerConnectionError,
  isLedgerDeviceLockedError,
  makeLedgerAppResponseError,
} from '@app/features/ledger/dmk/ledger-dmk-errors';
import { useLedgerDmk } from '@app/features/ledger/dmk/ledger-dmk.context';
import { closeLedgerSession } from '@app/features/ledger/dmk/ledger-session';
import { LedgerFlowSheet } from '@app/features/ledger/flow/ledger-flow-sheet';
import { useLedgerSteps } from '@app/features/ledger/flow/ledger-flow.context';
import type { SignStacksMessageLedgerFlowRequest } from '@app/features/ledger/flow/ledger-flow.types';
import { useSignerActionController } from '@app/features/ledger/utils/bitcoin-signer-kit-utils';
import {
  isCancellableConnectionInteraction,
  useCancelLedgerAction,
} from '@app/features/ledger/utils/generic-ledger-utils';
import {
  getStacksAppVersion,
  prepareLedgerDeviceStacksAppConnection,
  signLedgerStacksStructuredMessage,
  signLedgerStacksUtf8Message,
} from '@app/features/ledger/utils/stacks-ledger-utils';
import { stacksVersionGate } from '@app/features/ledger/utils/stacks-version-gate';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { StacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.models';

import { useLedgerAnalytics } from '../../hooks/use-ledger-analytics.hook';
import { useLedgerFingerprintMigration } from '../../hooks/use-ledger-fingerprint-migration';
import { useLedgerResponseState } from '../../utils/generic-ledger-utils';
import {
  LedgerMessageSigningContext,
  LedgerMsgSigningProvider,
} from './ledger-stacks-sign-msg.context';
import { ConnectLedgerSignMsg } from './steps/connect-ledger-sign-msg';
import { OutdatedStacksAppWarningMsgSigning } from './steps/outdated-stacks-app-warning-msg-signing';
import { SignLedgerMessage } from './steps/sign-stacks-ledger-message';

interface LedgerSignMsgProps {
  account: StacksAccount;
  unsignedMessage: UnsignedMessage;
}
function LedgerSignStacksMsg({ account, unsignedMessage }: LedgerSignMsgProps) {
  const dmk = useLedgerDmk();
  const signerActions = useSignerActionController();
  const ledgerNavigate = useLedgerSteps();
  const ledgerAnalytics = useLedgerAnalytics();
  const migrateFingerprintIfNeeded = useLedgerFingerprintMigration();

  const [latestDeviceResponse, setLatestDeviceResponse] = useLedgerResponseState();

  const [awaitingDeviceConnection, setAwaitingDeviceConnection] = useState(false);
  const [isConnectionCancellable, setIsConnectionCancellable] = useState(false);

  const chain = 'stacks';

  async function signMessage() {
    const [connectionError, stacksApp] = await safeAwait(
      prepareLedgerDeviceStacksAppConnection(dmk, {
        runAction: signerActions.run,
        onRequiredUserInteraction(interaction) {
          setLatestDeviceResponse({
            deviceLocked: interaction === UserInteractionRequired.UnlockDevice,
          });
          setIsConnectionCancellable(isCancellableConnectionInteraction(interaction));
        },
      })({
        setLoadingState: setAwaitingDeviceConnection,
        onError(e) {
          setIsConnectionCancellable(false);
          if (isLedgerDeviceLockedError(e)) {
            setLatestDeviceResponse({ deviceLocked: true });
            return;
          }
          handleLedgerConnectionError(e, { chain, ledgerNavigate, setLatestDeviceResponse });
        },
      })
    );
    setIsConnectionCancellable(false);
    if (connectionError || !stacksApp) return;

    try {
      // Show checking version page immediately
      void ledgerNavigate.toCheckingAppVersion();
      await delay(1000);

      const versionInfo = await getStacksAppVersion(stacksApp);
      ledgerAnalytics.trackDeviceVersionInfo(versionInfo);
      setLatestDeviceResponse({ deviceLocked: versionInfo.deviceLocked });
      if (versionInfo.deviceLocked) {
        setAwaitingDeviceConnection(false);
        return;
      }

      const passesVersionCheck = await stacksVersionGate(ledgerNavigate)(versionInfo);
      if (!passesVersionCheck) {
        setAwaitingDeviceConnection(false);
        return;
      }

      // Migrate fingerprint if needed (one-time)
      await migrateFingerprintIfNeeded(stacksApp);

      void ledgerNavigate.toConnectionSuccessStep('stacks');
      await delay(1000);
      void ledgerNavigate.toAwaitingDeviceOperation({ hasApprovedOperation: false });

      const resp = await whenSignableMessageOfType(unsignedMessage)({
        async utf8(msg) {
          return signLedgerStacksUtf8Message(stacksApp)(msg, account.derivationPath);
        },
        async structured(domain, msg) {
          return signLedgerStacksStructuredMessage(stacksApp)(
            serializeCV(domain),
            serializeCV(msg),
            account.derivationPath
          );
        },
      });

      // Assuming here that public keys are wrong. Alternatively, we may want
      // to proactively check the key before signing
      if (resp.returnCode === LedgerError.DataIsInvalid) {
        void ledgerNavigate.toDevicePayloadInvalid();
        return;
      }

      if (resp.returnCode === LedgerError.TransactionRejected) {
        void ledgerNavigate.toOperationRejectedStep(`Message signing operation rejected`);
        ledgerAnalytics.messageSignedOnLedgerRejected();
        appEvents.publish('ledgerStacksMessageSigningCancelled', { unsignedMessage });
        return;
      }

      if (resp.returnCode !== LedgerError.NoErrors) {
        throw makeLedgerAppResponseError(resp);
      }

      void ledgerNavigate.toAwaitingDeviceOperation({ hasApprovedOperation: true });
      await delay(1000);

      ledgerAnalytics.messageSignedOnLedgerSuccessfully();

      appEvents.publish('ledgerStacksMessageSigned', {
        messageSignatures: {
          signature: signatureVrsToRsv(resp.signatureVRS.toString('hex')),
          publicKey: account.stxPublicKey,
        },
        unsignedMessage,
      });
    } catch (e) {
      handleLedgerConnectionError(e, { chain, ledgerNavigate, setLatestDeviceResponse });
    } finally {
      await closeLedgerSession(dmk, stacksApp.sessionId);
    }
  }

  function closeAction() {
    signerActions.cancelActive();
    appEvents.publish('ledgerStacksMessageSigningCancelled', { unsignedMessage });
    void ledgerNavigate.cancelLedgerAction();
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
  request: SignStacksMessageLedgerFlowRequest;
}
export function LedgerSignMsgContainer({ request }: LedgerSignMsgContainerProps) {
  const account = useCurrentStacksAccount();
  if (!account) return null;
  return <LedgerSignStacksMsg account={account} unsignedMessage={request.message} />;
}
