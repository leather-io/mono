import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { bytesToHex } from '@noble/hashes/utils';
import { base64 } from '@scure/base';

import {
  compileWshDescriptor,
  findAccountDescriptorKey,
  getPsbtAsTransaction,
} from '@leather.io/bitcoin';
import { createRpcSuccessResponse } from '@leather.io/rpc';
import { buildUnsignedMultisigBtcTransfer } from '@leather.io/services';
import { delay } from '@leather.io/utils';

import { logger } from '@shared/logger';
import { sendMessageToOriginatingFrame } from '@shared/messaging/send-message-to-originating-frame';
import { RouteUrls } from '@shared/route-urls';
import { closeWindow } from '@shared/utils';
import { analytics } from '@shared/utils/analytics';

import { useGenerateUnsignedBitcoinTx } from '@app/common/transactions/bitcoin/use-generate-bitcoin-tx';
import { getTransactionActions } from '@app/components/rpc-transaction-request/get-transaction-actions';
import { useFeeEditorContext } from '@app/features/fee-editor/fee-editor.context';
import { getPolicyAuthNetworkId } from '@app/features/multisig/multisig-network';
import { useProposeMultisigTransaction } from '@app/features/multisig/use-propose-multisig-transaction';
import { useBitcoinBroadcastTransaction } from '@app/query/bitcoin/transaction/use-bitcoin-broadcast-transaction';
import { useSignBitcoinTx } from '@app/store/accounts/blockchain/bitcoin/bitcoin.hooks';
import { useCurrentNativeSegwitAccount } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';
import { createPolicyAddresses } from '@app/store/policy/policy-addresses';
import { useCurrentPolicy } from '@app/store/policy/policy.selectors';

import { useRpcSendTransferContext } from './rpc-send-transfer.context';

interface SendTransferActionLabels {
  approveLabel?: string;
  busyLabel?: string;
  submittedLabel?: string;
}
function getSendTransferActionLabels({
  broadcast,
  isBitcoinPolicy,
}: {
  broadcast: boolean;
  isBitcoinPolicy: boolean;
}): SendTransferActionLabels {
  if (isBitcoinPolicy) return { approveLabel: 'Propose transaction', busyLabel: 'Proposing...' };
  if (!broadcast)
    return { approveLabel: 'Sign transaction', busyLabel: 'Signing...', submittedLabel: 'Signed' };
  return {};
}

export function useRpcSendTransferActions() {
  const { availableBalance, selectedFee } = useFeeEditorContext();
  const { amount, broadcast, frameId, isLoadingBalance, recipients, requestId, tabId, utxos } =
    useRpcSendTransferContext();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const generateTx = useGenerateUnsignedBitcoinTx({ throwError: true });
  const signTransaction = useSignBitcoinTx();
  const { broadcastTx } = useBitcoinBroadcastTransaction();
  const navigate = useNavigate();
  const policy = useCurrentPolicy();
  const nativeSegwitAccount = useCurrentNativeSegwitAccount();
  const network = useCurrentNetwork();
  const { proposeMultisigTransaction } = useProposeMultisigTransaction();
  const isBitcoinPolicy = policy?.chain === 'bitcoin';

  const isInsufficientBalance = availableBalance.amount.isLessThan(amount.amount);

  const approverActions = useMemo(() => {
    function onCancel() {
      closeWindow();
    }

    async function onApprove() {
      setIsBroadcasting(true);

      function onError(e: unknown) {
        setIsBroadcasting(false);
        logger.error('Error broadcasting tx', e);
        void navigate(RouteUrls.SendBtcError, {
          state: {
            error: e,
          },
        });
      }

      try {
        const feeRate = selectedFee?.feeRate;
        if (!feeRate) return logger.error('No fee rate to generate tx');

        // Bitcoin policy account: build the unsigned multisig PSBT and propose it
        // to the coordinator instead of signing + broadcasting.
        if (policy && policy.chain === 'bitcoin') {
          const descriptorKey =
            nativeSegwitAccount &&
            findAccountDescriptorKey(
              compileWshDescriptor(policy.descriptor),
              nativeSegwitAccount.keychain
            );
          if (!descriptorKey)
            throw new Error('Current account is not a signer of this multisig policy');

          const rawPayload = await buildUnsignedMultisigBtcTransfer({
            descriptor: policy.descriptor,
            multisigAddress: policy.address,
            network: network.chain.bitcoin.mode,
            accountAddresses: createPolicyAddresses(policy),
            recipients,
            feeRate,
          });
          const proposal = await proposeMultisigTransaction({
            network: getPolicyAuthNetworkId('bitcoin', network),
            multisigAddress: policy.address,
            rawPayload,
          });

          analytics.track('propose_multisig_transaction', { symbol: 'btc' });

          void sendMessageToOriginatingFrame(
            { frameId, tabId },
            createRpcSuccessResponse('sendTransfer', {
              id: requestId,
              result: {
                proposalId: proposal.id,
                status: 'proposed',
                transaction: bytesToHex(getPsbtAsTransaction(base64.decode(rawPayload)).unsignedTx),
              },
            })
          );

          setIsSubmitted(true);
          await delay(500);
          closeWindow();
          return;
        }

        const resp = generateTx({ amount, recipients }, feeRate, utxos);
        if (!resp) return logger.error('Attempted to generate raw tx, but no tx exists');

        const tx = await signTransaction(resp.psbt, resp.signingConfig);

        tx.finalize();

        if (!broadcast) {
          setIsBroadcasting(false);

          void sendMessageToOriginatingFrame(
            { frameId, tabId },
            createRpcSuccessResponse('sendTransfer', {
              id: requestId,
              result: { transaction: tx.hex },
            })
          );

          setIsSubmitted(true);
          await delay(500);
          closeWindow();
          return;
        }

        await broadcastTx({
          tx: tx.hex,
          async onSuccess(txid) {
            setIsBroadcasting(false);

            analytics.track('broadcast_transaction', {
              symbol: 'btc',
              amount: amount.amount.toNumber(),
            });

            void sendMessageToOriginatingFrame(
              { frameId, tabId },
              createRpcSuccessResponse('sendTransfer', {
                id: requestId,
                result: { txid, transaction: tx.hex },
              })
            );

            setIsSubmitted(true);
            await delay(500);
            closeWindow();
          },
          onError,
        });
      } catch (error) {
        onError(error);
      } finally {
        setIsBroadcasting(false);
      }
    }

    return getTransactionActions({
      isLoading: isLoadingBalance,
      isError: isInsufficientBalance,
      isBroadcasting,
      isSubmitted,
      onCancel,
      onApprove,
      ...getSendTransferActionLabels({ broadcast, isBitcoinPolicy }),
    });
  }, [
    isLoadingBalance,
    isInsufficientBalance,
    isBroadcasting,
    isSubmitted,
    navigate,
    selectedFee?.feeRate,
    generateTx,
    amount,
    broadcast,
    frameId,
    recipients,
    utxos,
    signTransaction,
    broadcastTx,
    tabId,
    requestId,
    policy,
    nativeSegwitAccount,
    network,
    proposeMultisigTransaction,
    isBitcoinPolicy,
  ]);

  return {
    approverActions,
    isBroadcasting,
    isSubmitted,
  };
}
