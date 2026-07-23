import { useNavigate } from 'react-router';

import { RouteUrls } from '@shared/route-urls';
import { analytics } from '@shared/utils/analytics';

import { getPolicyAuthNetworkId } from '@app/features/multisig/multisig-network';
import { useProposeMultisigTransaction } from '@app/features/multisig/use-propose-multisig-transaction';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';
import { useCurrentPolicy } from '@app/store/policy/policy.selectors';

import type { ProposalSentSummaryState } from '../../../sent-summary/proposal-sent-summary';
import { useSendFormNavigate } from '../../hooks/use-send-form-navigate';

export function useProposeBtcSendTransaction() {
  const policy = useCurrentPolicy();
  const network = useCurrentNetwork();
  const navigate = useNavigate();
  const nav = useSendFormNavigate();
  const { proposeMultisigTransaction, isProposing } = useProposeMultisigTransaction();

  async function proposeSendTransaction(psbt: string, summary: ProposalSentSummaryState) {
    try {
      if (policy?.chain !== 'bitcoin')
        throw new Error('No active Bitcoin policy to propose the transaction from');

      const proposal = await proposeMultisigTransaction({
        network: getPolicyAuthNetworkId('bitcoin', network),
        multisigAddress: policy.address,
        rawPayload: psbt,
      });

      analytics.track('propose_multisig_transaction', { symbol: 'btc' });

      void navigate(RouteUrls.SentProposalSummary, {
        state: { ...summary, proposalId: proposal.id },
      });
    } catch (error) {
      void nav.toErrorPage(error);
    }
  }

  return { proposeSendTransaction, isProposing };
}
