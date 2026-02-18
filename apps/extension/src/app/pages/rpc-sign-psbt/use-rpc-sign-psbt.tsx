import { hexToBytes } from '@noble/hashes/utils';
import { bytesToHex } from '@stacks/common';

import type { Money } from '@leather.io/models';
import { RpcErrorCode, createRpcErrorResponse, createRpcSuccessResponse } from '@leather.io/rpc';
import { isError, sumMoney } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';
import { closeWindow } from '@shared/utils';
import { analytics } from '@shared/utils/analytics';

import { formatCurrency } from '@app/common/currency-formatter';
import { SignPsbtArgs } from '@app/common/psbt/requests';
import { useRpcSignPsbtParams } from '@app/common/psbt/use-psbt-request-params';
import { usePsbtSigner } from '@app/features/psbt-signer/hooks/use-psbt-signer';
import { useBitcoinBroadcastTransaction } from '@app/query/bitcoin/transaction/use-bitcoin-broadcast-transaction';
import { useCurrentNativeSegwitUtxos } from '@app/query/bitcoin/utxos/utxos.hooks';
import {
  useCalculateBitcoinFiatValue,
  useCryptoCurrencyMarketDataMeanAverage,
} from '@app/query/common/market-data/market-data.hooks';
import { useNavigate } from '@app/routes/compat';
import { useAppDispatch } from '@app/store';
import { useGetAssumedZeroIndexSigningConfig } from '@app/store/accounts/blockchain/bitcoin/bitcoin.hooks';
import { miscNavigationSlice } from '@app/store/navigation/misc-navigation.slice';

interface BroadcastSignedPsbtTxArgs {
  addressNativeSegwitTotal: Money;
  addressTaprootTotal: Money;
  fee: Money;
  tx: string;
  psbt: string;
}
export function useRpcSignPsbt() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { broadcast, origin, psbtHex, requestId, signAtIndex, tabId } = useRpcSignPsbtParams();
  const { signPsbt, getPsbtAsTransaction } = usePsbtSigner();
  const { broadcastTx, isBroadcasting } = useBitcoinBroadcastTransaction();
  const { refetchUtxos } = useCurrentNativeSegwitUtxos();
  const btcMarketData = useCryptoCurrencyMarketDataMeanAverage('BTC');
  const calculateBitcoinFiatValue = useCalculateBitcoinFiatValue();
  const getDefaultSigningConfig = useGetAssumedZeroIndexSigningConfig();

  if (!requestId || !psbtHex || !origin) throw new Error('Invalid params in useRpcSignPsbt');

  async function broadcastSignedPsbtTx({
    addressNativeSegwitTotal,
    addressTaprootTotal,
    fee,
    tx,
    psbt,
  }: BroadcastSignedPsbtTxArgs) {
    analytics.track('user_approved_sign_and_broadcast_psbt', {
      origin: origin || 'no_origin',
    });

    const transferTotalAsMoney = sumMoney([addressNativeSegwitTotal, addressTaprootTotal]);

    return await broadcastTx({
      tx,
      // skip utxos check for psbt txs
      skipSpendableCheckUtxoIds: 'all',
      async onSuccess(txid) {
        if (!requestId) throw new Error('Invalid request id');

        void chrome.tabs.sendMessage(
          tabId,
          createRpcSuccessResponse('signPsbt', {
            id: requestId,
            result: { hex: psbt, txid },
          })
        );

        await refetchUtxos();

        const psbtTxSummaryState = {
          fee: formatCurrency(fee, { preset: 'pad-decimals' }),
          sendingValue: formatCurrency(transferTotalAsMoney),
          totalSpend: formatCurrency(sumMoney([transferTotalAsMoney, fee])),
          txFiatValue: formatCurrency(calculateBitcoinFiatValue(transferTotalAsMoney)),
          txFiatValueSymbol: btcMarketData.price.symbol,
          txId: txid,
          txLink: {
            blockchain: 'bitcoin',
            txid: txid || '',
          },
          txValue: formatCurrency(transferTotalAsMoney),
        };

        dispatch(miscNavigationSlice.actions.setRpcSignPsbtSummary(psbtTxSummaryState));
        void navigate(RouteUrls.RpcSignPsbtSummary);
      },
      onError(e) {
        if (!requestId) throw new Error('Invalid request id');

        void chrome.tabs.sendMessage(
          tabId,
          createRpcErrorResponse('signPsbt', {
            id: requestId,
            error: { code: 4002, message: 'Failed to broadcast transaction' },
          })
        );
        dispatch(
          miscNavigationSlice.actions.setErrorState({
            message: isError(e) ? e.message : '',
            title: 'Failed to broadcast',
          })
        );
        void navigate(RouteUrls.RequestError);
      },
    });
  }

  return {
    indexesToSign: signAtIndex,
    isBroadcasting,
    origin,
    psbtHex,
    async onSignPsbt({ addressNativeSegwitTotal, addressTaprootTotal, fee }: SignPsbtArgs) {
      const tx = getPsbtAsTransaction(psbtHex);

      try {
        const signedTx = await signPsbt({
          tx,
          signingConfig: getDefaultSigningConfig(hexToBytes(psbtHex), signAtIndex),
        });

        const psbt = signedTx.toPSBT();

        if (!broadcast) {
          void chrome.tabs.sendMessage(
            tabId,
            createRpcSuccessResponse('signPsbt', {
              id: requestId,
              result: { hex: bytesToHex(psbt) },
            })
          );
          closeWindow();
          return;
        }

        // Optional args are handled here bc we support two request apis,
        // but we only support broadcasting using the rpc request method
        if (broadcast && addressNativeSegwitTotal && addressTaprootTotal && fee) {
          try {
            signedTx.finalize();

            await broadcastSignedPsbtTx({
              addressNativeSegwitTotal,
              addressTaprootTotal,
              fee,
              tx: signedTx.hex,
              psbt: bytesToHex(psbt),
            });
          } catch (e) {
            dispatch(
              miscNavigationSlice.actions.setErrorState({
                message: isError(e) ? e.message : '',
                title: 'Failed to finalize tx',
              })
            );
            return navigate(RouteUrls.RequestError);
          }

          return;
        }
      } catch (e) {
        dispatch(
          miscNavigationSlice.actions.setErrorState({
            message: isError(e) ? e.message : '',
            title: 'Failed to sign',
          })
        );
        return navigate(RouteUrls.RequestError);
      }
    },
    onCancel() {
      void chrome.tabs.sendMessage(
        tabId,
        createRpcErrorResponse('signPsbt', {
          id: requestId,
          error: {
            code: RpcErrorCode.USER_REJECTION,
            message: 'User rejected signing PSBT request',
          },
        })
      );
      closeWindow();
    },
  };
}
