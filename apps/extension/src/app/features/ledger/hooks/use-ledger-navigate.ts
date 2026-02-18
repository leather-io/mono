import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { bytesToHex } from '@stacks/common';

import type { SupportedBlockchains } from '@leather.io/models';

import { BitcoinInputSigningConfig } from '@shared/crypto/bitcoin/signer-config';
import { RouteUrls } from '@shared/route-urls';
import {
  type UnsignedMessage,
  toSerializableUnsignedMessage,
} from '@shared/signature/signature-types';

import { useLocation, useNavigate } from '@app/routes/compat';
import { type RootState, useAppDispatch } from '@app/store';
import { ledgerNavigationSlice } from '@app/store/navigation/ledger-navigation.slice';
import { modalNavigationSlice } from '@app/store/navigation/modal-navigation.slice';

export function useLedgerNavigate() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const fromLocationPathname = useSelector(
    (state: RootState) => state.navigation.ledger.fromLocationPathname
  );

  return useMemo(
    () => ({
      toConnectStepAndTryAgain() {
        dispatch(ledgerNavigationSlice.actions.setImmediatelyAttemptConnection(true));
        const parentPath = location.pathname.split('/').slice(0, -1).join('/') || '/';
        return navigate(`${parentPath}/${RouteUrls.ConnectLedger}`, {
          replace: true,
        });
      },

      toConnectAndSignStacksTransactionStep(transaction: string) {
        dispatch(ledgerNavigationSlice.actions.setLedgerTxSigningState({ tx: transaction }));
        return navigate(`${location.pathname}/${RouteUrls.ConnectLedger}`, {
          replace: true,
        });
      },

      toConnectAndSignBitcoinTransactionStep(
        psbt: Uint8Array,
        inputsToSign?: BitcoinInputSigningConfig[],
        fromLocation?: typeof location
      ) {
        dispatch(
          ledgerNavigationSlice.actions.setLedgerTxSigningState({
            tx: bytesToHex(psbt),
            inputsToSign,
            fromLocationPathname: fromLocation?.pathname,
          })
        );
        dispatch(modalNavigationSlice.actions.setBackgroundLocationPathname(RouteUrls.Home));
        return navigate(
          location.pathname.includes('/swap/bitcoin')
            ? `${location.pathname}/${RouteUrls.ConnectLedger}`
            : RouteUrls.ConnectLedger,
          {
            replace: true,
          }
        );
      },

      toConnectAndSignMessageStep(message: UnsignedMessage) {
        const serialized = toSerializableUnsignedMessage(message);
        dispatch(
          ledgerNavigationSlice.actions.setLedgerMessageSigningState({
            messageType: serialized.messageType,
            message:
              serialized.messageType === 'utf8'
                ? serialized.message
                : bytesToHex(serialized.message as Uint8Array),
            domain:
              serialized.messageType === 'structured'
                ? Array.from((serialized as { domain: Uint8Array }).domain)
                : undefined,
          })
        );
        return navigate(RouteUrls.ConnectLedger, {
          replace: true,
        });
      },

      toDeviceBusyStep(description?: string) {
        dispatch(ledgerNavigationSlice.actions.setLedgerDescription(description));
        dispatch(modalNavigationSlice.actions.setBackgroundLocationPathname(RouteUrls.Home));
        return navigate(RouteUrls.DeviceBusy, {
          replace: true,
        });
      },

      toConnectionSuccessStep(chain: SupportedBlockchains) {
        dispatch(ledgerNavigationSlice.actions.setLedgerConnectionState({ chain }));
        dispatch(modalNavigationSlice.actions.setBackgroundLocationPathname(RouteUrls.Home));
        return navigate(RouteUrls.ConnectLedgerSuccess, {
          replace: true,
        });
      },

      toErrorStep(chain: SupportedBlockchains, errorMessage?: string) {
        dispatch(
          ledgerNavigationSlice.actions.setLedgerErrorState({
            chain,
            latestLedgerError: errorMessage,
          })
        );
        dispatch(modalNavigationSlice.actions.setBackgroundLocationPathname(RouteUrls.Home));
        return navigate(RouteUrls.ConnectLedgerError, {
          replace: true,
        });
      },

      toAwaitingDeviceOperation({ hasApprovedOperation }: { hasApprovedOperation: boolean }) {
        dispatch(ledgerNavigationSlice.actions.setLedgerApprovedOperation(hasApprovedOperation));
        dispatch(modalNavigationSlice.actions.setBackgroundLocationPathname(RouteUrls.Home));
        return navigate(RouteUrls.AwaitingDeviceUserAction, {
          replace: true,
        });
      },

      toPublicKeyMismatchStep() {
        dispatch(modalNavigationSlice.actions.setBackgroundLocationPathname(RouteUrls.Home));
        return navigate(RouteUrls.LedgerPublicKeyMismatch, {
          replace: true,
        });
      },

      toDevicePayloadInvalid() {
        dispatch(modalNavigationSlice.actions.setBackgroundLocationPathname(RouteUrls.Home));
        return navigate(RouteUrls.LedgerDevicePayloadInvalid, {
          replace: true,
        });
      },

      toOperationRejectedStep(description?: string) {
        dispatch(ledgerNavigationSlice.actions.setLedgerDescription(description));
        dispatch(modalNavigationSlice.actions.setBackgroundLocationPathname(RouteUrls.Home));
        return navigate(RouteUrls.LedgerOperationRejected, {
          replace: true,
        });
      },

      toDeviceDisconnectStep() {
        dispatch(modalNavigationSlice.actions.setBackgroundLocationPathname(RouteUrls.Home));
        return navigate(RouteUrls.LedgerDisconnected, {
          replace: true,
        });
      },

      toBroadcastErrorStep(error: string) {
        dispatch(ledgerNavigationSlice.actions.setLedgerBroadcastError(error));
        dispatch(modalNavigationSlice.actions.setBackgroundLocationPathname(RouteUrls.Home));
        return navigate(RouteUrls.LedgerBroadcastError, {
          replace: true,
        });
      },

      cancelLedgerAction() {
        dispatch(ledgerNavigationSlice.actions.setLedgerWentBack());

        if (fromLocationPathname) {
          return navigate(fromLocationPathname, { replace: true });
        }

        const parentPath = location.pathname.split('/').slice(0, -1).join('/') || '/';
        return navigate(parentPath, { replace: true });
      },

      cancelLedgerActionAndReturnHome() {
        dispatch(ledgerNavigationSlice.actions.resetLedgerNavigation());
        return navigate(RouteUrls.Home);
      },
    }),

    [location, navigate, dispatch, fromLocationPathname]
  );
}
