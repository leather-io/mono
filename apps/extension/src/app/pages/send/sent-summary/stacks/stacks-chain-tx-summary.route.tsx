import { useSelector } from 'react-redux';

import { deserializeTransaction } from '@stacks/transactions';
import z from 'zod';

import { StacksChainTxSummaryLoader } from '@app/pages/send/sent-summary/stacks/stacks-chain-tx-summary.loader';
import { Navigate, useParams } from '@app/routes/compat';
import type { RootState } from '@app/store';

import { Sip10SentSummary, StxSentSummary } from './stacks-chain-tx-summary';
import { StacksChainTxSummaryLoading } from './stacks-chain-tx-summary.layout';

const routeParamsSchema = z.object({
  symbol: z.string(),
  txid: z.string(),
});

export function StacksChainTxSummaryRoute() {
  const { data: params } = routeParamsSchema.safeParse(useParams());
  const tx = useSelector((state: RootState) => state.navigation.send.stxConfirmation?.tx);

  if (!params) return <Navigate to="/" replace />;

  const SummaryComponent =
    params.symbol.toUpperCase() === 'STX' ? StxSentSummary : Sip10SentSummary;

  if (!tx) {
    return (
      <StacksChainTxSummaryLoader
        txid={params.txid}
        fallback={<StacksChainTxSummaryLoading txid={params.txid} />}
      >
        {({ rawTx }) => <SummaryComponent {...params} tx={deserializeTransaction(rawTx)} />}
      </StacksChainTxSummaryLoader>
    );
  }

  return <SummaryComponent {...params} tx={deserializeTransaction(tx)} />;
}
