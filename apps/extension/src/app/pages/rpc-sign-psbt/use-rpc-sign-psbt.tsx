import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { hexToBytes } from '@noble/hashes/utils';
import { bytesToHex } from '@stacks/common';

import { finalizeWshDescriptorPsbt, psbtHexToBase64 } from '@leather.io/bitcoin';
import type { Money } from '@leather.io/models';
import { RpcErrorCode, createRpcErrorResponse, createRpcSuccessResponse } from '@leather.io/rpc';
import { createMoney, isError, sumMoney } from '@leather.io/utils';

import { sendMessageToOriginatingFrame } from '@shared/messaging/send-message-to-originating-frame';
import { RouteUrls } from '@shared/route-urls';
import { RpcErrorMessage } from '@shared/rpc/methods/validation.utils';
import { closeWindow } from '@shared/utils';
import { analytics } from '@shared/utils/analytics';

import { formatCurrency } from '@app/common/currency-formatter';
import { SignPsbtArgs } from '@app/common/psbt/requests';
import { useRpcSignPsbtParams } from '@app/common/psbt/use-psbt-request-params';
import { getPolicyAuthNetworkId } from '@app/features/multisig/multisig-network';
import { useProposeMultisigTransaction } from '@app/features/multisig/use-propose-multisig-transaction';
import { useDescriptorPsbtDetails } from '@app/features/psbt-signer/hooks/use-descriptor-psbt-details';
import { usePsbtSigner } from '@app/features/psbt-signer/hooks/use-psbt-signer';
import { useBitcoinBroadcastTransaction } from '@app/query/bitcoin/transaction/use-bitcoin-broadcast-transaction';
import { useCurrentUtxos } from '@app/query/bitcoin/utxos/utxos.hooks';
import {
  useCalculateBitcoinFiatValue,
  useCryptoCurrencyMarketDataMeanAverage,
} from '@app/query/common/market-data/market-data.hooks';
import { useGetAssumedZeroIndexSigningConfig } from '@app/store/accounts/blockchain/bitcoin/bitcoin.hooks';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';

import { useSignDescriptorPsbt } from './descriptor-psbt.hooks';
import { useBondProposalRoute } from './use-bond-proposal-route';

interface BroadcastSignedPsbtTxArgs {
  addressNativeSegwitTotal: Money;
  addressTaprootTotal: Money;
  fee: Money;
  tx: string;
  psbt: string;
}
export function useRpcSignPsbt() {
  const navigate = useNavigate();
  const { broadcast, descriptor, frameId, origin, psbtHex, requestId, signAtIndex, tabId } =
    useRpcSignPsbtParams();
  const { signPsbt, getPsbtAsTransaction } = usePsbtSigner();
  const signDescriptorPsbt = useSignDescriptorPsbt();
  const descriptorDetails = useDescriptorPsbtDetails(psbtHex ?? '', descriptor ?? '');
  const { broadcastTx, isBroadcasting } = useBitcoinBroadcastTransaction();
  const { refetchUtxos } = useCurrentUtxos();
  const btcMarketData = useCryptoCurrencyMarketDataMeanAverage('BTC');
  const calculateBitcoinFiatValue = useCalculateBitcoinFiatValue();
  const getDefaultSigningConfig = useGetAssumedZeroIndexSigningConfig();
  const currentNetwork = useCurrentNetwork();
  const { proposeMultisigTransaction, isProposing } = useProposeMultisigTransaction();
  const bondRoute = useBondProposalRoute({ descriptor, psbtHex: psbtHex ?? '' });

  useEffect(() => {
    if (bondRoute?.status !== 'error' || !requestId) return;
    void sendMessageToOriginatingFrame(
      { frameId, tabId },
      createRpcErrorResponse('signPsbt', {
        id: requestId,
        error: { code: bondRoute.code, message: bondRoute.message },
      })
    );
    void navigate(RouteUrls.RequestError, {
      state: { message: bondRoute.message, title: 'Unable to propose transaction' },
    });
  }, [bondRoute, frameId, tabId, requestId, navigate]);

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
      skipTaprootWarning: true,
      async onSuccess(txid) {
        if (!requestId) throw new Error('Invalid request id');

        void sendMessageToOriginatingFrame(
          { frameId, tabId },
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
            txId: txid || '',
          },
          txValue: formatCurrency(transferTotalAsMoney),
        };

        void navigate(RouteUrls.RpcSignPsbtSummary, { state: psbtTxSummaryState });
      },
      onError(e) {
        if (!requestId) throw new Error('Invalid request id');

        void sendMessageToOriginatingFrame(
          { frameId, tabId },
          createRpcErrorResponse('signPsbt', {
            id: requestId,
            error: {
              code: 4002,
              message: 'Failed to broadcast transaction',
              data: { hex: psbt },
            },
          })
        );
        void navigate(RouteUrls.RequestError, {
          state: { message: isError(e) ? e.message : '', title: 'Failed to broadcast' },
        });
      },
    });
  }

  return {
    broadcast,
    descriptor,
    bondProposal: bondRoute?.status === 'matched' ? bondRoute : null,
    indexesToSign: signAtIndex,
    isBroadcasting: isBroadcasting || isProposing,
    origin,
    psbtHex,
    async onSignPsbt({ addressNativeSegwitTotal, addressTaprootTotal, fee }: SignPsbtArgs) {
      if (bondRoute?.status === 'error') return;

      if (bondRoute?.status === 'matched') {
        try {
          const network = getPolicyAuthNetworkId('bitcoin', currentNetwork);
          const rawPayload = psbtHexToBase64(psbtHex);
          const proposal = await proposeMultisigTransaction({
            network,
            multisigAddress: bondRoute.policy.address,
            rawPayload,
          });

          analytics.track('propose_multisig_transaction', { symbol: 'btc' });

          await sendMessageToOriginatingFrame(
            { frameId, tabId },
            createRpcSuccessResponse('signPsbt', {
              id: requestId,
              result: { hex: psbtHex, proposalId: proposal.id, status: 'proposed' },
            })
          ).catch(() => null);
          closeWindow();
          return;
        } catch (e) {
          void sendMessageToOriginatingFrame(
            { frameId, tabId },
            createRpcErrorResponse('signPsbt', {
              id: requestId,
              error: {
                code: RpcErrorCode.INTERNAL_ERROR,
                message: 'Failed to propose transaction',
              },
            })
          );
          return navigate(RouteUrls.RequestError, {
            state: {
              message: isError(e) ? e.message : 'Failed to propose transaction',
              title: 'Unable to propose transaction',
            },
          });
        }
      }

      // Descriptor signing adds the current account's partial signature for the
      // input(s) the descriptor locks. With broadcast requested, we additionally
      // try to satisfy the whole policy from what the PSBT already carries (other
      // signatures + relayed preimages) and broadcast; if it can't be fully
      // satisfied we fall back to returning the partially-signed PSBT for the
      // coordinator to complete.
      if (descriptor) {
        try {
          const signedTx = await signDescriptorPsbt(psbtHex, descriptor);
          const signedPsbtHex = bytesToHex(signedTx.toPSBT());

          if (broadcast) {
            const rawTx = finalizeWshDescriptorPsbt({
              signedPsbt: signedTx.toPSBT(),
              preimagePsbt: hexToBytes(psbtHex),
              descriptor,
            });
            if (rawTx) {
              const destinations = descriptorDetails?.destinations ?? [];
              const amountSentFromPolicy = destinations.length
                ? sumMoney(destinations.map(destination => destination.value))
                : createMoney(0, 'BTC');

              await broadcastSignedPsbtTx({
                addressNativeSegwitTotal: amountSentFromPolicy,
                addressTaprootTotal: createMoney(0, 'BTC'),
                fee: descriptorDetails?.fee ?? createMoney(0, 'BTC'),
                tx: rawTx,
                psbt: signedPsbtHex,
              });
              return;
            }
          }

          void sendMessageToOriginatingFrame(
            { frameId, tabId },
            createRpcSuccessResponse('signPsbt', {
              id: requestId,
              result: { hex: signedPsbtHex },
            })
          );
          closeWindow();
          return;
        } catch (e) {
          void sendMessageToOriginatingFrame(
            { frameId, tabId },
            createRpcErrorResponse('signPsbt', {
              id: requestId,
              error: {
                code: RpcErrorCode.INVALID_REQUEST,
                message: RpcErrorMessage.UnsignedTransaction,
              },
            })
          );
          return navigate(RouteUrls.RequestError, {
            state: { message: isError(e) ? e.message : '', title: 'Failed to sign' },
          });
        }
      }

      const tx = getPsbtAsTransaction(psbtHex);

      try {
        const signedTx = await signPsbt({
          tx,
          signingConfig: getDefaultSigningConfig(hexToBytes(psbtHex), signAtIndex),
        });

        const psbt = signedTx.toPSBT();

        if (!broadcast) {
          void sendMessageToOriginatingFrame(
            { frameId, tabId },
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
            return navigate(RouteUrls.RequestError, {
              state: {
                message: isError(e) ? e.message : '',
                title: 'Failed to finalize tx',
              },
            });
          }

          return;
        }
      } catch (e) {
        return navigate(RouteUrls.RequestError, {
          state: { message: isError(e) ? e.message : '', title: 'Failed to sign' },
        });
      }
    },
    onCancel() {
      void sendMessageToOriginatingFrame(
        { frameId, tabId },
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
