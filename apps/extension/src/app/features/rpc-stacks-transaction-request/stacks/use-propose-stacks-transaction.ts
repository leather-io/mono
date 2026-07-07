import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { type StacksTransactionWire } from '@stacks/transactions';
import { useMutation } from '@tanstack/react-query';

import { createProposeMultisigTransactionMutationConfig } from '@leather.io/queries';
import { type RpcMethodNames, createRpcSuccessResponse } from '@leather.io/rpc';
import { deriveStxMultisigAddress } from '@leather.io/stacks';
import { delay, isString } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';
import { closeWindow } from '@shared/utils';
import { analytics } from '@shared/utils/analytics';

import { useRpcRequestParams } from '@app/common/hooks/use-rpc-request-params';
import { getPolicyAuthNetworkId } from '@app/features/multisig/multisig-network';
import { useSignProposalCommitment } from '@app/features/multisig/use-sign-proposal-commitment';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';
import { useCurrentPolicy } from '@app/store/policy/policy.selectors';

import { useRpcTransactionRequest } from '../use-rpc-transaction-request';

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
  const { onSetTransactionStatus } = useRpcTransactionRequest();
  const { tabId, requestId } = useRpcRequestParams();
  const policy = useCurrentPolicy();
  const account = useCurrentStacksAccount();
  const network = useCurrentNetwork();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const signProposalCommitment = useSignProposalCommitment();
  const { mutateAsync: proposeMultisigTransaction } = useMutation(
    createProposeMultisigTransactionMutationConfig({ signProposalCommitment })
  );

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

        void chrome.tabs.sendMessage(
          tabId,
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
          state: { message: getErrorMessage(error) },
        });
      }
    },
    [
      method,
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
