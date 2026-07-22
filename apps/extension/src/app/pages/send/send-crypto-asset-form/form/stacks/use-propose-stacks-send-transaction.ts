import { useLocation, useNavigate } from 'react-router';

import { type StacksTransactionWire } from '@stacks/transactions';

import { deriveStxMultisigAddress } from '@leather.io/stacks';
import { isString } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';
import { analytics } from '@shared/utils/analytics';

import { getPolicyAuthNetworkId } from '@app/features/multisig/multisig-network';
import { useProposeMultisigTransaction } from '@app/features/multisig/use-propose-multisig-transaction';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';
import { useCurrentPolicy } from '@app/store/policy/policy.selectors';

import type { ProposalSentSummaryState } from '../../../sent-summary/proposal-sent-summary';

const placeholderNonce = 0;

function getErrorMessage(error: unknown) {
  if (isString(error)) return error;
  if (error instanceof Error) return error.message;
  return 'Unknown error';
}

export function useProposeStacksSendTransaction() {
  const policy = useCurrentPolicy();
  const account = useCurrentStacksAccount();
  const network = useCurrentNetwork();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { proposeMultisigTransaction, isProposing } = useProposeMultisigTransaction();

  async function proposeSendTransaction(
    unsignedTx: StacksTransactionWire,
    summary: ProposalSentSummaryState
  ) {
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

    try {
      const proposal = await proposeMultisigTransaction({
        network: getPolicyAuthNetworkId('stacks', network),
        multisigAddress: policy.address,
        rawPayload,
      });

      analytics.track('propose_multisig_transaction', { symbol: 'stx' });

      void navigate(RouteUrls.SentProposalSummary, {
        state: { ...summary, proposalId: proposal.id },
      });
    } catch (error) {
      // Absolute path: with a Ledger wallet the popup is on the nested ledger
      // signing route when this rejects, so a relative navigation would
      // resolve against the wrong parent.
      void navigate(`${pathname}/${RouteUrls.BroadcastError}`, {
        state: { message: getErrorMessage(error) },
      });
    }
  }

  return { proposeSendTransaction, isProposing };
}
