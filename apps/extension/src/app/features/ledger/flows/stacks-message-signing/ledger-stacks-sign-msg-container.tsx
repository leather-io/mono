import { useState } from 'react';
import { Outlet } from 'react-router';

import { signatureVrsToRsv } from '@stacks/common';
import { serializeCV } from '@stacks/transactions';
import { LedgerError } from '@zondax/ledger-stacks';

import { Sheet, SheetHeader } from '@leather.io/ui';
import { delay, isError } from '@leather.io/utils';

import { logger } from '@shared/logger';
import { UnsignedMessage, whenSignableMessageOfType } from '@shared/signature/signature-types';

import { useScrollLock } from '@app/common/hooks/use-scroll-lock';
import { appEvents } from '@app/common/publish-subscribe';
import { useCancelLedgerAction } from '@app/features/ledger/utils/generic-ledger-utils';
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
import { useLedgerNavigate } from '../../hooks/use-ledger-navigate';
import { checkLockedDeviceError, useLedgerResponseState } from '../../utils/generic-ledger-utils';
import {
  LedgerMessageSigningContext,
  LedgerMsgSigningProvider,
} from './ledger-stacks-sign-msg.context';
import { useUnsignedMessageType } from './use-message-type';

interface LedgerSignMsgData {
  account: StacksAccount;
  unsignedMessage: UnsignedMessage;
}
interface LedgerSignMsgDataProps {
  children({ account, unsignedMessage }: LedgerSignMsgData): React.JSX.Element;
}
function LedgerSignMsgData({ children }: LedgerSignMsgDataProps) {
  const account = useCurrentStacksAccount();
  const unsignedMessage = useUnsignedMessageType();
  if (!unsignedMessage || !account) return null;
  return children({ account, unsignedMessage });
}

type LedgerSignMsgProps = LedgerSignMsgData;
function LedgerSignStacksMsg({ account, unsignedMessage }: LedgerSignMsgProps) {
  useScrollLock(true);
  const ledgerNavigate = useLedgerNavigate();
  const ledgerAnalytics = useLedgerAnalytics();
  const migrateFingerprintIfNeeded = useLedgerFingerprintMigration();

  const [latestDeviceResponse, setLatestDeviceResponse] = useLedgerResponseState();

  const [awaitingDeviceConnection, setAwaitingDeviceConnection] = useState(false);

  const chain = 'stacks';

  async function signMessage() {
    const stacksApp = await prepareLedgerDeviceStacksAppConnection({
      setLoadingState: setAwaitingDeviceConnection,
      onError(e) {
        if (isError(e) && checkLockedDeviceError(e)) {
          setLatestDeviceResponse({ deviceLocked: true } as any);
          return;
        }
        void ledgerNavigate.toErrorStep(chain);
      },
    });

    try {
      // Show checking version page immediately
      void ledgerNavigate.toCheckingAppVersion();
      await delay(1000);

      const versionInfo = await getStacksAppVersion(stacksApp);
      ledgerAnalytics.trackDeviceVersionInfo(versionInfo);
      setLatestDeviceResponse(versionInfo);
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
        throw new Error('Some other error');
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
    } catch {
      void ledgerNavigate.toDeviceDisconnectStep();
    } finally {
      try {
        await stacksApp.transport.close();
      } catch (e) {
        logger.error('Error closing transport after message signing', e);
      }
    }
  }

  function closeAction() {
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
  const canCancelLedgerAction = useCancelLedgerAction(awaitingDeviceConnection);

  return (
    <LedgerMsgSigningProvider value={ledgerContextValue}>
      <Sheet
        isShowing
        header={<SheetHeader />}
        onClose={canCancelLedgerAction ? closeAction : undefined}
      >
        <Outlet />
      </Sheet>
    </LedgerMsgSigningProvider>
  );
}

export function LedgerSignMsgContainer() {
  return <LedgerSignMsgData>{props => <LedgerSignStacksMsg {...props} />}</LedgerSignMsgData>;
}
