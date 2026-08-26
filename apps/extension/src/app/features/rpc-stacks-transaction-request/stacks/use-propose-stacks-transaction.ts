import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { type StacksTransactionWire } from '@stacks/transactions';

import { type RpcMethodNames, createRpcSuccessResponse } from '@leather.io/rpc';
import { getErrorDetail } from '@leather.io/services';
import { deriveStxMultisigAddress } from '@leather.io/stacks';
import { delay, isString } from '@leather.io/utils';

import { sendMessageToOriginatingFrame } from '@shared/messaging/send-message-to-originating-frame';
import { RouteUrls } from '@shared/route-urls';
import { closeWindow } from '@shared/utils';
import { analytics } from '@shared/utils/analytics';

import { getPolicyAuthNetworkId } from '@app/features/multisig/multisig-network';
import { useProposeMultisigTransaction } from '@app/features/multisig/use-propose-multisig-transaction';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';
import { useCurrentPolicy } from '@app/store/policy/policy.selectors';

import { useStacksRpcTransactionRequestContext } from './stacks-rpc-transaction-request.context';

const placeholderNonce = 0;

function getErrorMessage(error: unknown) {
  if (isString(error)) return error;
  if (error instanceof Error) return error.message;
  return 'Unknown error';
}

// Sibling to useSignAndBroadcastStacksTransaction: instead of signing +
// broadcasting, it proposes the unsigned multisig transaction to the coordinator
// (commitment signed in-process with the parent key) and returns a proposed
// result to the dApp.
export function useProposeStacksTransaction(method: RpcMethodNames) {
  const { onSetTransactionStatus, tabId, requestId, frameId } =
    useStacksRpcTransactionRequestContext();
  const policy = useCurrentPolicy();
  const account = useCurrentStacksAccount();
  const network = useCurrentNetwork();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { proposeMultisigTransaction } = useProposeMultisigTransaction();

  return useCallback(
    async (unsignedTx: StacksTransactionWire) => {
      if (policy?.chain !== 'stacks')
        throw new Error('No active Stacks policy to propose the transaction from');

      if (!account || !policy.publicKeys.includes(account.stxPublicKey))
        throw new Error('Current account is not a signer of this multisig policy');

      const derivedAddress = deriveStxMultisigAddress({
        publicKeys: policy.publicKeys,
        threshold: policy.threshold,
        chainId: network.chain.stacks.chainId,
      });
      if (derivedAddress !== policy.address)
        throw new Error('Derived multisig sender does not match the policy address');

      unsignedTx.setNonce(placeholderNonce);
      const rawPayload = unsignedTx.serialize();
      onSetTransactionStatus('broadcasting');

      try {
        const proposal = await proposeMultisigTransaction({
          network: getPolicyAuthNetworkId('stacks', network),
          multisigAddress: policy.address,
          rawPayload,
        });

        analytics.track('propose_multisig_transaction', { symbol: 'stx' });
        onSetTransactionStatus('submitted');

        void sendMessageToOriginatingFrame(
          { frameId, tabId },
          createRpcSuccessResponse(method, {
            id: requestId,
            result: {
              transaction: rawPayload,
              proposalId: proposal.id,
              status: 'proposed',
            },
          })
        );

        await delay(250);
        closeWindow();
      } catch (error) {
        onSetTransactionStatus('idle');
        // Absolute path: with a Ledger wallet the popup is on the nested ledger
        // signing route when this rejects, so a relative navigation would
        // resolve against the wrong parent.
        return navigate(`${pathname}/${RouteUrls.BroadcastError}`, {
          state: { message: getErrorDetail(error) ?? getErrorMessage(error), proposeMode: true },
        });
      }
    },
    [
      method,
      frameId,
      policy,
      account,
      network,
      navigate,
      pathname,
      proposeMultisigTransaction,
      onSetTransactionStatus,
      tabId,
      requestId,
    ]
  );
}
