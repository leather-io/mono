import { useMemo } from 'react';

import { bytesToHex } from '@noble/hashes/utils';
import * as btc from '@scure/btc-signer';

import { delay, isError } from '@leather.io/utils';

import { logger } from '@shared/logger';

import { appEvents } from '@app/common/publish-subscribe';
import {
  isLedgerActionCancelledError,
  isLedgerUserDeniedError,
} from '@app/features/ledger/dmk/ledger-dmk-errors';
import { useLedgerDmk } from '@app/features/ledger/dmk/ledger-dmk.context';
import { useLedgerSteps } from '@app/features/ledger/flow/ledger-flow.context';
import type { SignBitcoinTxLedgerFlowRequest } from '@app/features/ledger/flow/ledger-flow.types';
import { ApproveSignLedgerBitcoinTx } from '@app/features/ledger/flows/bitcoin-tx-signing/steps/approve-bitcoin-sign-ledger-tx';
import { LedgerTxSigningContext } from '@app/features/ledger/generic-flows/tx-signing/ledger-sign-tx.context';
import { TxSigningFlow } from '@app/features/ledger/generic-flows/tx-signing/tx-signing-flow';
import { useLedgerSignTx } from '@app/features/ledger/generic-flows/tx-signing/use-ledger-sign-tx';
import { useLedgerAnalytics } from '@app/features/ledger/hooks/use-ledger-analytics.hook';
import {
  connectLedgerBitcoinApp,
  getBitcoinAppVersion,
  isBitcoinAppOpen,
} from '@app/features/ledger/utils/bitcoin-ledger-utils';
import { useSignerActionController } from '@app/features/ledger/utils/bitcoin-signer-kit-utils';
import { useCancelLedgerAction } from '@app/features/ledger/utils/generic-ledger-utils';
import type { LedgerBitcoinApp } from '@app/features/ledger/utils/ledger-app';
import { useSignLedgerBitcoinTx } from '@app/store/accounts/blockchain/bitcoin/bitcoin.hooks';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';

import { useSignLedgerDescriptorTx } from './use-sign-ledger-descriptor-tx';

interface LedgerSignBitcoinTxContainerProps {
  request: SignBitcoinTxLedgerFlowRequest;
}
export function LedgerSignBitcoinTxContainer({ request }: LedgerSignBitcoinTxContainerProps) {
  const dmk = useLedgerDmk();
  const signerActions = useSignerActionController();
  const ledgerNavigate = useLedgerSteps();
  const ledgerAnalytics = useLedgerAnalytics();

  const signLedger = useSignLedgerBitcoinTx();
  const signLedgerDescriptor = useSignLedgerDescriptorTx();
  const network = useCurrentNetwork();

  const { psbt, inputsToSign, descriptor, settleOnRejection } = request;
  const unsignedTransactionRaw = useMemo(() => bytesToHex(psbt), [psbt]);
  const unsignedTransaction = useMemo(() => btc.Transaction.fromPSBT(psbt), [psbt]);

  const chain = 'bitcoin';

  const {
    signTransaction,
    latestDeviceResponse,
    awaitingDeviceConnection,
    isConnectionCancellable,
  } = useLedgerSignTx<LedgerBitcoinApp>({
    chain,
    isAppOpen: isBitcoinAppOpen({ network: network.chain.bitcoin.mode }),
    getAppVersion: getBitcoinAppVersion(dmk),
    connectApp: connectLedgerBitcoinApp(dmk, network.chain.bitcoin.mode, signerActions.run),
    async signTransactionWithDevice(bitcoinApp) {
      void ledgerNavigate.toDeviceBusyStep('Verifying public key on Ledger…');

      void ledgerNavigate.toConnectionSuccessStep('bitcoin');
      await delay(1200);

      void ledgerNavigate.toAwaitingDeviceOperation({ hasApprovedOperation: false });

      try {
        const btcTx = descriptor
          ? await signLedgerDescriptor(
              bitcoinApp,
              unsignedTransaction.toPSBT(),
              descriptor,
              inputsToSign
            )
          : await signLedger(bitcoinApp, unsignedTransaction.toPSBT(), inputsToSign);

        if (!btcTx) throw new Error('No tx returned');
        void ledgerNavigate.toAwaitingDeviceOperation({ hasApprovedOperation: true });
        await delay(1200);
        appEvents.publish('ledgerBitcoinTxSigned', {
          signedPsbt: btcTx,
          unsignedPsbt: unsignedTransactionRaw,
        });
      } catch (e) {
        if (isLedgerActionCancelledError(e)) return;
        logger.error('Unable to sign tx with ledger', e);
        ledgerAnalytics.transactionSignedOnLedgerRejected();
        // Descriptor signing is awaited by the rpc popup, which owns the error
        // UI and the dApp response. Settle that promise with the error rather
        // than leaving it to hang forever. Other flows keep the standard
        // on-device rejection screen.
        if (descriptor || (settleOnRejection && !isLedgerUserDeniedError(e))) {
          appEvents.publish('ledgerBitcoinTxSigningCancelled', {
            unsignedPsbt: unsignedTransactionRaw,
            error: isError(e) ? e.message : undefined,
          });
        } else if (settleOnRejection) {
          appEvents.publish('ledgerBitcoinTxSigningCancelled', {
            unsignedPsbt: unsignedTransactionRaw,
          });
        } else {
          void ledgerNavigate.toOperationRejectedStep();
        }
      }
    },
  });

  function closeAction() {
    signerActions.cancelActive();
    appEvents.publish('ledgerBitcoinTxSigningCancelled', { unsignedPsbt: unsignedTransactionRaw });
    void ledgerNavigate.cancelLedgerAction();
  }

  const ledgerContextValue: LedgerTxSigningContext = {
    chain,
    transaction: unsignedTransaction,
    signTransaction,
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
      renderStep={{ 'awaiting-device-operation': <ApproveSignLedgerBitcoinTx /> }}
    />
  );
}
