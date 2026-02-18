import { useMemo } from 'react';

import { StacksTransactionWire } from '@stacks/transactions';
import { AxiosError } from 'axios';

import type { OwnedUtxo } from '@leather.io/models';

import { BitcoinSendFormValues } from '@shared/models/form.model';
import { RouteUrls } from '@shared/route-urls';

import { useLocation, useNavigate } from '@app/routes/compat';
import { useAppDispatch } from '@app/store';
import { sendNavigationSlice } from '@app/store/navigation/send-navigation.slice';

interface ConfirmationRouteStacksSip10Args {
  decimals?: number;
  name?: string;
  tx: StacksTransactionWire;
}

interface ConfirmationRouteBtcArgs {
  tx: string;
  recipient: string;
  fee: number;
  feeRowValue: string;
  time: string;
}

export function useSendFormNavigate() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  return useMemo(
    () => ({
      toChooseTransactionFee(
        isSendingMax: boolean,
        utxos: OwnedUtxo[],
        values: BitcoinSendFormValues
      ) {
        dispatch(sendNavigationSlice.actions.setBtcChooseFeeState({ isSendingMax, utxos, values }));
        return navigate(RouteUrls.SendBtcChooseFee);
      },
      toConfirmAndSignBtcTransaction({
        tx,
        recipient,
        fee,
        feeRowValue,
        time,
      }: ConfirmationRouteBtcArgs) {
        dispatch(
          sendNavigationSlice.actions.setBtcConfirmationState({
            tx,
            recipient,
            fee,
            feeRowValue,
            time,
          })
        );
        return navigate(RouteUrls.SendBtcConfirmation);
      },
      toConfirmAndSignStxTransaction(tx: StacksTransactionWire, showFeeChangeWarning: boolean) {
        dispatch(
          sendNavigationSlice.actions.setStxConfirmationState({
            tx: tx.serialize(),
            showFeeChangeWarning,
          })
        );
        return navigate(RouteUrls.SendStxConfirmation);
      },
      toConfirmAndSignStacksSip10Transaction({
        decimals,
        name,
        tx,
      }: ConfirmationRouteStacksSip10Args) {
        dispatch(
          sendNavigationSlice.actions.setStxConfirmationState({
            tx: tx.serialize(),
            showFeeChangeWarning: false,
            decimals,
            token: name,
          })
        );
        return navigate(`${location.pathname}/confirm`);
      },
      toErrorPage(error: unknown) {
        const processedError = error instanceof AxiosError ? new Error(error.message) : error;
        dispatch(sendNavigationSlice.actions.setSendError(processedError));
        const parentPath = location.pathname.split('/').slice(0, -1).join('/') || '/';
        return navigate(`${parentPath}/error`, {
          replace: true,
        });
      },
    }),
    [navigate, location, dispatch]
  );
}
